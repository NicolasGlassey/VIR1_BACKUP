/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 * @date      2022-12-05
 * 
 */

"use strict";
const { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand } = require("@aws-sdk/client-ec2");

module.exports = class Ami {

    // #region Private members
    #client;
    // #endregion

    // #region Public members
    /**
     * @brief This method constructs an Ami object.
     * @param {EC2Client} client : the client used to communicate with the AWS API. 
     */
    constructor(regionName) {
        this.#client = new EC2Client({ region: regionName });
    }

    /**
     * @brief This method is used to find an AMI.
     * @param {string} amiName : the name of the AMI to find. 
     * @returns {object} ami : the AMI found.
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

    async exists(name) {
        const ami = await this.find(name);
        return ami !== undefined;
    }

    /**
     * @brief This method is used to create an AMI from an instance.
     * @param {string} amiName : the name of the AMI to create. 
     * @param  {string} instanceId : the instance ID from which the AMI will be created.
     * @returns response : the response of the request.
     */
    async create(amiName, instanceId) {
        const input = {
            'InstanceId': instanceId,
            'Name': amiName,
            'Description': 'ami created by jest',
            'TagSpecifications': [{
                'ResourceType': 'image',
                'Tags': [{
                    'Key': 'Name',
                    'Value': amiName
                }]
            }]
        };

        // Create the image
        const command = new CreateImageCommand(input);
        const response = await this.#client.send(command);

        if (await !this.exists(amiName)) {
            throw new Error('Snapshot not created');
        }

        return response;
    }

    /**
     * @brief This method is used to delete an AMI.
     * @param {string} imageId : the ID of the AMI to delete.
     * @returns response : the response of the request.
     */
    async delete(amiName) {
        const image = await this.find(amiName);

        if (image === undefined) throw new Error('Ami not exist');

        const input = {
            'ImageId': image.ImageId,
        };

        // Delete the image
        const command = new DeregisterImageCommand(input);
        const response = await this.#client.send(command);

        if (await this.exists(amiName)) {
            throw new Error('Ami not exist');
        }

        return response;
    }
    // #endregion

    // #region Private methods
    // #endregion
}