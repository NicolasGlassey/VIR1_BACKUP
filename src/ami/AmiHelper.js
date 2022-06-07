/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 * @date      2022-12-05
 * 
 */

"use strict";
const { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const InstanceNotFoundException = require("../ami/exceptions/InstanceNotFoundException.js");
const AmiNotFoundException = require("../ami/exceptions/AmiNotFoundException.js");
const AmiAlreadyExistException = require("../ami/exceptions/AmiAlreadyExistException.js");
const AmiCreationException = require("../ami/exceptions/AmiCreationException.js");
const AmiDeletionException = require("../ami/exceptions/AmiDeletionException.js");


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
     * @param {string} name : the name of the AMI to find. 
     * @returns {object} ami : the AMI found.
     */
    async find(name) {
        const config = {
            'Filters': [
                { 'Name': 'name', 'Values': [name] }
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

    async findInstance(name) {
        const input = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] }
            ]
        }
        const command = new DescribeInstancesCommand(input);
        const response = await this.#client.send(command);

        return response.Reservations;
    }

    async existsInstance(name) {
        const instances = await this.findInstance(name);
        return instances.length > 0;
    }

    async getInstanceId(name) {
        const instances = await this.findInstance(name);
        return instances[0].Instances[0].InstanceId;
    }

    /**
     * @brief This method is used to create an AMI from an instance.
     * @param {string} name : the name of the AMI to create. 
     * @param  {string} instanceName : the instance ID from which the AMI will be created.
     * @returns response : the response of the request.
     */
    async create(name, instanceName) {

        if (!await this.existsInstance(instanceName)) {
            throw new InstanceNotFoundException('Instance not found');
        }

        if (await this.exists(name)) {
            throw new AmiAlreadyExistException('Ami already exists');
        }

        let instanceId = await this.getInstanceId(instanceName);

        const input = {
            'InstanceId': instanceId,
            'Name': name,
            'Description': 'ami created by jest',
            'TagSpecifications': [{
                'ResourceType': 'image',
                'Tags': [{
                    'Key': 'Name',
                    'Value': name
                }]
            }]
        };

        // Create the image
        const command = new CreateImageCommand(input);
        let response;
        try {
            response = await this.#client.send(command)
        } catch (error) {
            throw new AmiCreationException('Ami creation failed');
        }

        return response;
    }

    /**
     * @brief This method is used to delete an AMI.
     * @param {string} imageId : the ID of the AMI to delete.
     * @returns response : the response of the request.
     */
    async delete(name) {
        const ami = await this.find(name);

        if (ami === undefined) throw new AmiNotFoundException('Ami does not exist');

        const input = {
            'ImageId': ami.ImageId,
        };

        // Delete the image
        const command = new DeregisterImageCommand(input);
        await this.#client.send(command);
    }
    // #endregion

    // #region Private methods
    // #endregion
}