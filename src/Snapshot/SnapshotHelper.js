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
        const result = await this.#client.send(command);

        console.log(result);
        if (this.exists(name)) {

        }

        return result;
    }

    async delete(name) {
        const snapshot = await SnapshotHelper.find(name);

        const input = {
            'SnapshotId': snapshot.SnapshotId
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        if (!this.exists(name)) {

        }

        return response;
    }
}