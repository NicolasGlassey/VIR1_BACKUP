/**
 * @brief     This class is used to manage an AMI from an instance.
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";

const { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");
const InstanceNotFoundException = require("../exceptions/instance/InstanceNotFoundException.js");
const AmiNotFoundException = require("../exceptions/ami/AmiNotFoundException.js");
const AmiAlreadyExistException = require("../exceptions/ami/AmiAlreadyExistException.js");
const AmiInvalidNumberException = require("../exceptions/ami/AmiInvalidNumberException.js");
const InstanceHelper = require("./InstanceHelper.js");
const { Logger, AwsCloudClientImpl } = require("vir1-core");


module.exports = class AmiHelper {

    // #region Private members
    #client;
    #awsCloudClientImpl;
    #instanceHelper;
    // #endregion

    // #region Public members

    /**
     * @param {*} regionName 
     */
    constructor(regionName) {
        this.#awsCloudClientImpl = new AwsCloudClientImpl(regionName);
        this.#client = new EC2Client({ region: regionName });
        this.#instanceHelper = new InstanceHelper(regionName);
    }

    /**
     * @brief This method is used to create an AMI from an instance.
     * @param {string} name : the name of the AMI to create. 
     * @param  {string} instanceName : the instance ID from which the AMI will be created.
     * @returns response : the response of the request.
     */
    async create(name, instanceName) {

        if (!await this.#awsCloudClientImpl.exists(AwsCloudClientImpl.INSTANCE, instanceName)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.create: Instance ${instanceName} does not exist`, Logger.ERROR);
            throw new InstanceNotFoundException(`Instance ${instanceName} not found`);
        }

        if (await this.#awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, name)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.create: Image ${name} already exists`, Logger.ERROR);
            throw new AmiAlreadyExistException(`Image ${name} already exists`);
        }

        let instanceId = await this.#instanceHelper.instanceId(instanceName).catch(err => {
            throw err;
        })

        // Create the image from the instance with 2 tags : 
        // - Name : the name of the AMI
        // - Source : the ID of the instance from which the AMI is created, so that we can find from witch instance the AMI is created.
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

        await this.#awsCloudClientImpl.log(`AmiHelper.create: Creating AMI ${name} from instance ${instanceId}`, Logger.INFO);

        // Create the image
        const command = new CreateImageCommand(input);

        return await this.#client.send(command);
    }

    /**
     * @brief This method is used to delete an AMI.
     * @param {string} imageId : the ID of the AMI to delete.
     * @returns response : the response of the request.
     */
    async delete(name) {

        if (!await this.#awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, name)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.delete: Image ${name} already exists`, Logger.ERROR);
            throw new AmiNotFoundException(`Image ${name} not found`);
        }

        const imageId = (await this.#find(name)).ImageId;

        const input = {
            'ImageId': imageId,
        };

        await this.#awsCloudClientImpl.log(`AmiHelper.delete: Deleting AMI ${name}`, Logger.INFO);

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
    async describeFromInstance(instanceName) {

        if (!await this.#awsCloudClientImpl.exists(AwsCloudClientImpl.INSTANCE, instanceName)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.describeFromInstance: Instance ${instanceName} does not exist`, Logger.ERROR);
            throw new InstanceNotFoundException(`Instance ${instanceName} does not exist`);
        }

        let instanceId = await this.#instanceHelper.instanceId(instanceName).catch(err => {
            throw err;
        });

        const input = {
            'Filters': [
                { 'Name': 'tag:Source', 'Values': [instanceId] }
            ]
        };

        // Find the image
        const commandDescribeImages = new DescribeImagesCommand(input);
        const response = await this.#client.send(commandDescribeImages);

        await this.#awsCloudClientImpl.log(`AmiHelper.describeFromInstance: Found ${response.Images.length} AMIs from instance ${instanceName}`, Logger.INFO);

        return response.Images;
    }

    /**
     * @brief This method is used to delete all AMIs from an instance.
     * @param {*} instanceName 
     */
    async deleteFromInstance(instanceName) {
        const amis = await this.describeFromInstance(instanceName);
        for (let ami of amis) {
            await this.delete(ami.Name);
        }
    }

    /**
     * @brief This method is used to detect if an instance has more than X AMIs.
     * @param {*} instanceName
     * @param {*} number  
     * @returns {boolean} true if the instance has more or equal than X AMIs, false otherwise.
     */
    async hasMoreThanXAmiFromInstance(instanceName, number) {

        if (!await this.#awsCloudClientImpl.exists(AwsCloudClientImpl.INSTANCE, instanceName)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.hasMoreThanXAmiFromInstance: Instance ${instanceName} does not exist`, Logger.ERROR);
            throw new InstanceNotFoundException(`Instance ${instanceName} does not exist`);
        }

        if (isNaN(number)) {
            await this.#awsCloudClientImpl.log(`AmiHelper.hasMoreThanXAmiFromInstance: Number ${number} is not a number`, Logger.ERROR);
            throw new AmiInvalidNumberException(`Number ${number} is not a number`);
        }

        const amis = await this.describeFromInstance(instanceName);

        return amis.length >= number;
    }

    // #endregion

    // #region Private methods

    /**
     * @brief This method is used to find an AMI.
     * @param {string} name : the name of the AMI to find. 
     * @returns response: the image
     */
    async #find(name) {
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
    // #endregion
}