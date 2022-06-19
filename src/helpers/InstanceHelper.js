/**
 * @brief     This class is used to manage an AMI from an instance.
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";

const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const InstanceNotFoundException = require("../exceptions/instance/InstanceNotFoundException.js");
const { Logger, AwsCloudClientImpl } = require("vir1-core");


module.exports = class InstanceHelper {

    // #region Private members
    #client;
    #awsCloudClientImpl;
    // #endregion

    // #region Public members

    /**
     * @param {*} regionName 
     */
    constructor(regionName) {
        this.#awsCloudClientImpl = new AwsCloudClientImpl(regionName);
        this.#client = new EC2Client({ region: regionName });
    }

    /**
     * This method is used to get the instance ID from an instance name.
     * @param {*} name 
     * @returns 
     */
    async instanceId(name) {
        const instances = await this.#find(name);

        if (instances.length === 0) {
            this.#awsCloudClientImpl.log(`InstanceHelper.instanceId: Instance ${name} not found.`, Logger.ERROR);
            throw new InstanceNotFoundException(`Instance ${name} not found.`);
        }

        this.#awsCloudClientImpl.log(`InstanceHelper.instanceId: Instance ${name} found.`, Logger.INFO);

        return instances[0].Instances[0].InstanceId;
    }
    // #endregion

    // #region Private methods

    /**
     * This method is used to find an Instance.
     * @param {*} name 
     * @returns 
     */
    async #find(name) {
        const input = {
            'Filters': [
                { 'Name': 'tag:Name', 'Values': [name] }
            ]
        }
        const command = new DescribeInstancesCommand(input);
        const response = await this.#client.send(command);

        return response.Reservations;
    }
    // #endregion
}