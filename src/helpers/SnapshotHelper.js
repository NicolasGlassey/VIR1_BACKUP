const { EC2Client, CreateSnapshotsCommand, CreateSnapshotCommand, DeleteSnapshotCommand, DescribeSnapshotsCommand, DescribeVolumesCommand } = require("@aws-sdk/client-ec2");
const SnapshotAlreadyExistException = require("../exceptions/snapshot/SnapshotAlreadyExistException");
const SnapshotNotFoundException = require("../exceptions/snapshot/SnapshotNotFoundException");
const SnapshotNotCreatedException = require("../exceptions/snapshot/SnapshotNotCreatedException");
const SnapshotVolumeNotFoundException = require("../exceptions/snapshot/SnapshotVolumeNotFoundException");

module.exports = class SnapshotHelper {
    // #region Private members
    #client;
    // #endRegion
    /**
     * @param {*} regionName 
     */
    constructor(regionName) {
        this.#client = new EC2Client({ region: regionName });
    }
    /**
     * @breif This methode is used to find snapshot by name
     * @param {string} name : the name of the snapshot
     * @returns response : the response of the request
     */
    async find(name) {
        const config = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] },
            ]
        };

        const response = await this.#client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots[0];
    }
    /**
     * @breif This methode is used to check if a snapshot exist by name
     * @param {string} name : the name of the snapshot
     * @returns bool
     */
    async exists(name) {
        const snapshot = await this.find(name);
        return snapshot !== undefined;
    }
    /**
     * @breif This methode is used to create a snapshot by is volume name , is name and description
     * @param {*} volumeName 
     * @param {*} name : the name of the snapshot
     * @param {*} description : the description of the snapshot
     * @returns response : the response of the request
     */
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
    /**
     * @breif This methode is used to delete a snapshot by is name
     * @param {string} name : the name of the snapshot
     * @returns result : the result of the request
     */
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
    /**
     * @breif This methode is used to find a volume by is name
     * @param {*} name : volume name
     * @returns response : the response of the request
     */
    async findVolume(name) {
        const input = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] },
            ]
        };

        const response = await this.#client.send(new DescribeVolumesCommand(input));

        return response.Volumes[0];
    }
    /**
     * @breif This methode is used to find a volume id by is name
     * @param {*} name : volume name
     * @returns volume.VolumeId : id of the volume
     */
    async getVolumeId(name) {
        const volume = await this.findVolume(name);

        if (volume === undefined) {
            throw new SnapshotVolumeNotFoundException('Volume not found');
        }

        return volume.VolumeId;
    }
    /**
     * @breif This methode is used to find all snapshots by volume name
     * @param {*} volumeName 
     * @returns response.Snapshots : array of snapshot
     */
    async findAllByVolume(volumeName) {
        
        const volumeId = await this.getVolumeId(volumeName);
        if (volumeId === undefined) {
            throw new SnapshotVolumeNotFoundException('Volume not found');
        }
        const config = {
            'Filters': [
                { 'Name': 'volume-id', 'Values': [volumeId] }
            ]
        };
        const response = await this.#client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots;
    }
    /**
     * @breif This methode is used to delete all snapshots by volume name
     * @param {*} volumeName 
     * @returns responses : array of response of delete
     */
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
    /**
     * @breif This methode is used to check if a volume has more all snapshots than a x value
     * @param {*} volumeName 
     * @param {*} number 
     * @returns bool
     */
    async hasMoreThanXSnapshotFromVolume(volumeName, number){

        const snapshots = await this.findAllByVolume(volumeName);

        return snapshots.length >= number;
    } 
}