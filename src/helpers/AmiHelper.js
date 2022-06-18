/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 * @date      2022-12-05
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";
const { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const InstanceNotFoundException = require("./ami/exceptions/InstanceNotFoundException.js");
const AmiNotFoundException = require("./ami/exceptions/AmiNotFoundException.js");
const AmiAlreadyExistException = require("../exceptions/ami/AmiAlreadyExistException.js");
const AmiNumberException = require("../exceptions/ami/AmiNumberException.js");
const { Logger, AwsCloudClientImpl } = require("vir1-core");


module.exports = class Ami {

    // #region Private members
    #client;
    #AwsCloudClientImpl;
    // #endregion

    // #region Public members
    /**
     * @brief This method constructs an Ami object.
     * @param {EC2Client} client : the client used to communicate with the AWS API. 
     */
    constructor(regionName) {
        this.#client = new EC2Client({ region: regionName });
        this.#AwsCloudClientImpl = new AwsCloudClientImpl(regionName);
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

    /**
     * This method is used to check if an AMI exists.
     * @param {*} name 
     * @returns 
     */
    async exists(name) {
        const ami = await this.find(name);
        return ami !== undefined;
    }

    /**
     * This method is used to find an Instance.
     * @param {*} name 
     * @returns 
     */
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

    /**
     * This method is used to check if an instance exists.
     * @param {*} name 
     * @returns 
     */
    async existsInstance(name) {
        const instances = await this.findInstance(name);
        return instances.length > 0;
    }

    /**
     * This method is used to get the instance ID from an instance name.
     * @param {*} name 
     * @returns 
     */
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
                }, {
                    'Key': 'Source',
                    'Value': instanceId
                }
                ]
            }]
        };

        // Create the image
        const command = new CreateImageCommand(input);

        const response = await this.#client.send(command);

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

    /**
     * @brief This method is used to get a list of AMIs from an instance.
     * @param {string} instanceName : the name of the instance.
     * @returns {array}
     * @throws {AmiNotFoundException} : if the AMI does not exist.
     **/
    async allFromSpecificInstance(instanceName) {

        if (!await this.#AwsCloudClientImpl.exists(AwsCloudClientImpl.INSTANCE, instanceName)) {
            this.#AwsCloudClientImpl.log(`Instance ${instanceName} does not exist`, Logger.ERROR);
            throw new InstanceNotFoundException('Instance not found');
        }

        let instanceId = await this.getInstanceId(instanceName);

        const input = {
            'Filters': [
                { 'Name': 'tag:Source', 'Values': [instanceId] }
            ]
        };

        // Find the image
        const commandDescribeImages = new DescribeImagesCommand(input);
        const response = await this.#client.send(commandDescribeImages);

        this.#AwsCloudClientImpl.log(`Found ${response.Images.length} AMIs`);
        return response.Images;
    }

    async deleteAllFromSpecificInstance(instanceName) {
        const amis = await this.allFromSpecificInstance(instanceName);
        for (let ami of amis) {
            await this.delete(ami.Name);
        }
    }

    async hasMoreAmiThan(number, instanceName) {

        if (isNaN(number)) throw new AmiNumberException(`${number} is not a number`);

        const amis = await this.allFromSpecificInstance(instanceName);

        return amis.length >= number;
    }

    // #endregion

    // #region Private methods
    // #endregion
}