/**
 * @file      Ami.js
 * @brief     This class is used to manage an AMI from an instance.
 * @author    Created by Anthony Bouillant
 * @date      2022-12-05
 * 
 */

"use strict";

const { CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand } = require("@aws-sdk/client-ec2");

module.exports = class Ami {

    // #region Private members
    #client;
    #ami;
    // #endregion

    // #region Public members
    /**
     * @brief This method constructs an Ami object.
     * @param {EC2Client} client : the client used to communicate with the AWS API. 
     */
    constructor(client) {
        this.#client = client;
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
        };

        // Create the image
        const command = new CreateImageCommand(input);
        const response = await this.#client.send(command);

        if (response.$metadata.httpStatusCode == 200) {
            this.ami = await this.find(amiName);
        }

        return response;
    }

    /**
     * @brief This method is used to delete an AMI.
     * @param {string} imageId : the ID of the AMI to delete.
     * @returns response : the response of the request.
     */
    async delete() {
        const input = {
            'ImageId': this.#ami.ImageId,
        };

        // Delete the image
        const command = new DeregisterImageCommand(input);
        const response = await this.#client.send(command);

        if (response.$metadata.httpStatusCode == 200) this.ami = null;

        return response;
    }

    /**
     * @brief This method is used to set the ami.
     * @param {Ami} ami : the ami to set.
     */
    set ami(ami) {
        this.#ami = ami
    }

    /**
     * @brief This method is used to get the ami.
     * @returns {Ami} ami : this ami.
     */
    get ami() {
        return this.#ami;
    }
    // #endregion

    // #region Private methods
    // #endregion
}