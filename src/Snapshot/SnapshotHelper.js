const { EC2Client, CreateSnapshotCommand, DeleteSnapshotCommand, DescribeSnapshotsCommand } = require("@aws-sdk/client-ec2");


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
    async create(volumeId, name, description = null) {
        if (await this.exists(name)) {
            throw new Error('Snapshot already exists');
        }

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
        //TODO: check if snapshot status is available
        const result = await this.#client.send(command);

        if (await !this.exists(name)) {
            throw new Error('Snapshot not created');
        }

        return result;
    }

    async delete(name) {
        const snapshot = await this.find(name);

        if (snapshot === undefined) {
            throw new Error('Snapshot not exist');
        }

        const input = {
            'SnapshotId': snapshot.SnapshotId
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        if (this.exists(name)) {
            throw new Error('Snapshot not deleted');
        }

        console.log(result);
        return result;
    }
}