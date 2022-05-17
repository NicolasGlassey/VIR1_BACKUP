const { EC2Client, CreateSnapshotCommand, DeleteSnapshotCommand, DescribeSnapshotsCommand } = require("@aws-sdk/client-ec2");


module.exports = class Snapshot {
    #snapshot;
    #client;

    constructor(client) {
        this.#client = client;
    }

    static async find(name, client) {
        const config = {
            'Filters': [
                { 'Name': 'name', 'Values': [name] },
            ]
        };

        const response = await client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots[0];
    }

    async create(volumeId, name, description = null) {
        const input = {
            'VolumeId': volumeId,
            'TagSpecification': [
                { 'Name': name }
            ],
            'Description': description
        };

        const command = new CreateSnapshotCommand(input);
        const result = await this.#client.send(command);

        if (result.$metadata.httpStatusCode === 200) {
            this.#snapshot = await Snapshot.find(name, this.#client);
        }

        return result;
    }

    async delete() {
        const input = {
            'SnapshotId': this.#snapshot.SnapshotId
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        if (response.$metadata.httpStatusCode === 200) {
            this.#snapshot = null;
        }

        return response;
    }
    set snapshot(snapshot) {
        this.#snapshot = snapshot;
    }
    get snapshot() {
        return this.#snapshot;
    }
}