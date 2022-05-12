/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 */

"use strict";

const { CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand } = require("@aws-sdk/client-ec2");

module.exports = class Ami {

    #client;
    #ami;

    constructor(client) {
        this.#client = client;
    }

    /**
     * Verify if the AMI exists.
     * @returns 
     */
    async find(amiName) {
        const config = {
            'Filters': [
                { 'Name': 'name', 'Values': [amiName] }
            ]
        }

        // Find the image
        const commandDescribeImages = new DescribeImagesCommand(config);
        const response = await this.#client.send(commandDescribeImages);

        return response.Images[0];
    }

    async create(amiName, instanceId) {
        const input = {
            'InstanceId': instanceId,
            'Name': amiName,
            'Description': 'ami created by jest',
        };

        // Create the image
        const command = new CreateImageCommand(input);
        const response = await this.#client.send(command);

        if (response.$metadata.httpStatusCode == 200) {
            this.ami = await this.find(amiName);
        }

        return response;
    }

    async delete(imageId) {
        const input = {
            'ImageId': imageId,
        };

        // Delete the image
        const command = new DeregisterImageCommand(input);
        const response = await this.#client.send(command);

        if (response.$metadata.httpStatusCode == 200) this.ami = null;

        return response;
    }

    /**
     * @param {any} amiName
     */
    set ami(amiName) {
        this.#ami = amiName
    }

    get ami() {
        return this.#ami;
    }
}