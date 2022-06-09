const { EC2Client, CreateSnapshotCommand, DeleteSnapshotCommand, DescribeSnapshotsCommand, DescribeVolumesCommand } = require("@aws-sdk/client-ec2");
const SnapshotAlreadyExist = require("./exceptions/SnapshotAlreadyExist");
const SnapshotNotFound = require("./exceptions/SnapshotNotFound");
const SnapshotNotCreated = require("./exceptions/SnapshotNotCreated");
const SnapshotVolumeNotFound = require("./exceptions/SnapshotVolumeNotFound");

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
            throw new SnapshotAlreadyExist('Snapshot already exists');
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
            throw new SnapshotNotCreated('Snapshot not created');
        }

        return result;
    }

    async delete(name) {
        const snapshot = await this.find(name);

        if (snapshot === undefined) {
            throw new SnapshotNotFound('Snapshot not found');
        }

        const input = {
            'SnapshotId': snapshot.SnapshotId
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        if (result.SnapshotId !== undefined) {
            throw new Error('Snapshot not deleted');
        }
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
            throw new SnapshotVolumeNotFound('Volume not found');
        }

        return volume.VolumeId;
    }
}