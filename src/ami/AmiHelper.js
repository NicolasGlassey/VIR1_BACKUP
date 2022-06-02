/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 * @date      2022-12-05
 * 
 */

"use strict";
import { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand } from "@aws-sdk/client-ec2";
import AmiAlreadyExistsException from "./exceptions/AmiAlreadyExistsException";
import AmiDeleteException from "./exceptions/AmiDeleteException";
import AmiDoesNotExist from "./exceptions/AmiDoesNotExist";
import AmiNotCreatedException from "./exceptions/AmiCreateException";


export default class Ami {

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

    /**
     * @brief This method is used to create an AMI from an instance.
     * @param {string} name : the name of the AMI to create. 
     * @param  {string} instanceId : the instance ID from which the AMI will be created.
     * @returns response : the response of the request.
     */
    async create(name, instanceId) {

        if (await this.exists(name)) {
            throw new AmiAlreadyExistsException('Ami already exists');
        }

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
        const response = await this.#client.send(command);

        if (await !this.exists(name)) {
            throw new AmiNotCreatedException('Ami not created');
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

        if (ami === undefined) throw new AmiDoesNotExist('Ami does not exist');

        const input = {
            'ImageId': ami.ImageId,
        };

        // Delete the image
        const command = new DeregisterImageCommand(input);
        await this.#client.send(command);

        if (await this.exists(name)) {
            throw new AmiDeleteException('Ami Still Exists');
        }
    }
    // #endregion

    // #region Private methods
    // #endregion
}