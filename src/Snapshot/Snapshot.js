const { EC2Client, CreateSnapshotCommand, DeleteSnapshotCommand } = require("@aws-sdk/client-ec2");


module.exports = class Snapshot {
    #id;
    #name;
    #description;
    #client;

    constructor(name, description, client){
        this.#name = name;
        this.#description = description;
        this.#client = client;
    }

    async static find(name, client){
        const config = {
            'Filters': [
                {'Name': 'name', 'Values': [name]},
            ]
        };

        const response = await this.#client.send(new DescribeSnapshotsCommand(config));

        return response.Snapshots[0];
    }

    async create(volumeId){
        const input = {
            'VolumeId': volumeId,
            'TagSpecification': [
                {'Name': this.#name}
            ] ,
            'Description': this.#description
        };

        const command = new CreateSnapshotCommand(input);
        const result = await this.#client.send(command);

        if(result.$metadata.httpStatusCode === 200) {
            this.#id = result.SnapshotId;
        }

        return result;
    }

    async delete(){
        if(!this.#id) {
            throw new Error('Snapshot not created');
        }
        const input = {
            'SnapshotId': this.#id
        }

        const command = new DeleteSnapshotCommand(input);
        const result = await this.#client.send(command);

        if(response.$metadata.httpStatusCode === 200) {
            this.#id = null;
            this.#name = null;
            this.#description = null;
        }

        return response;

}