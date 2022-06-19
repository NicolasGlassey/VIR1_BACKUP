const { EC2Client, CreateSnapshotsCommand, CreateSnapshotCommand, DeleteSnapshotCommand, DescribeSnapshotsCommand, DescribeVolumesCommand } = require("@aws-sdk/client-ec2");
const SnapshotAlreadyExistException = require("../exceptions/snapshot/SnapshotAlreadyExistException");
const SnapshotNotFoundException = require("../exceptions/snapshot/SnapshotNotFoundException");
const SnapshotNotCreatedException = require("../exceptions/snapshot/SnapshotNotCreatedException");
const SnapshotVolumeNotFoundException = require("../exceptions/snapshot/SnapshotVolumeNotFoundException");

module.exports = class SnapshotHelper {
    #client;

    constructor(regionName) {
        this.#client = new EC2Client({ region: regionName });
    }

    async find(name) {
        const config = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] },
            ]
        };

        const response = await this.#client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots[0];
    }
    async exists(name) {
        const snapshot = await this.find(name);
        return snapshot !== undefined;
    }
    async create(volumeName, name, description = null) {
        if (await this.exists(name)) {
            throw new SnapshotAlreadyExistException('Snapshot already exists');
        }
        let volumeId = await this.getVolumeId(volumeName);

        const input = {
            'VolumeId': volumeId,
            'TagSpecifications': [{
                'ResourceType': 'snapshot',
                'Tags': [{
                    'Key': 'Name',
                    'Value': name,
                }]
            }],
            'Description': description
        };

        const command = new CreateSnapshotCommand(input);
        //TODO:check if snapshot status is available

        const result = await this.#client.send(command);


        if (result.SnapshotId === undefined) {
            throw new SnapshotNotCreatedException('Snapshot not created');
        }

        return result;
    }

    async delete(name) {
        const snapshot = await this.find(name);

        if (snapshot === undefined) {
            throw new SnapshotNotFoundException('Snapshot not found');
        }

        const input = {
            'SnapshotId': snapshot.SnapshotId
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        return result;
    }
    async findVolume(name) {
        const input = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] },
            ]
        };

        const response = await this.#client.send(new DescribeVolumesCommand(input));

        return response.Volumes[0];
    }
    async getVolumeId(name) {
        const volume = await this.findVolume(name);

        if (volume === undefined) {
            throw new SnapshotVolumeNotFoundException('Volume not found');
        }

        return volume.VolumeId;
    }
    async findAllByVolume(volumeName) {
        const volumeId = await this.getVolumeId(volumeName);
        const config = {
            'Filters': [
                { 'Name': 'volume-id', 'Values': [volumeId] }
            ]
        };
        const response = await this.#client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots;
    }
    async deleteAllByVolume(volumeName)
    {
        const snapshots =  await this.findAllByVolume(volumeName);

        if (snapshots === undefined) {
            throw new SnapshotNotFoundException('Snapshot not found');
        }
        let responses = []
        for(const element of snapshots){
           responses.push( await this.delete(element.Tags[0].Value));
        }
    
        return responses;
    }
    async hasMoreThanXSnapshotFromVolume(volumeName, number){
        const snapshots = await this.findAllByVolume(volumeName);

        return snapshots.length >= number;
    } 
}