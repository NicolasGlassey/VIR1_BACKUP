/**
 * Author : Anthony Bouillant
 * Date : 11.02.2022
 * Description : Test the AMI module
 */

"use strict";
const { EC2Client, CreateImageCommand, DeregisterImageCommand, DescribeImagesCommand, DescribeImages } = require("@aws-sdk/client-ec2");

var client, imageId;

beforeAll(() => {
    client = new EC2Client({ region: "eu-west-3" });
});

test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {

    // Check if the image is created
    const config = {
        'Filters': [
            { 'Name': 'name', 'Values': ['ami-jest-1'] }
        ]
    }

    var commandDescribeImages = new DescribeImagesCommand(config);
    var response = await client.send(commandDescribeImages);
    if (response.Images.length > 0 && response.Images[0].Name == 'ami-jest-1') {
        imageId = response.Images[0].ImageId;
        return;
    };

    /** input parameters */
    const input = {
        'InstanceId': 'i-04199df6d81374547',
        'Name': 'ami-jest-1',
        'Description': 'ami created by jest',
    };

    // Create the image
    var command = new CreateImageCommand(input);
    response = await client.send(command);
    imageId = response.$metadata.imageId;

    expect(response.$metadata.httpStatusCode).toEqual(200);

    // Get the image freshly created
    response = await client.send(commandDescribeImages);
    expect(response.Images[0].ImageId).toBeDefined();

    // Set the image to be deregistered
    imageId = response.Images[0].ImageId;
})

test('AMICreate_InstanceNotExist_ThrowInvalidInstanceIDNotFound', async () => {
    const input = {
        'InstanceId': 'i-04199df6d81374949',
        'Name': 'ami-jest-1',
        'Description': 'ami created by jest',
    };
    const command = new CreateImageCommand(input);

    try {
        await client.send(command)
    } catch (error) {
        expect(error.name).toEqual('InvalidInstanceID.NotFound');
    }

})

test('AMICreate_InstanceNotExist_ThrowErrorInvalidParameterValue', async () => {
    const input = {
        'InstanceId': 'i-041ererererererer',
        'Name': 'ami-jest-1',
        'Description': 'ami created by jest',
    };
    const command = new CreateImageCommand(input);

    try {
        await client.send(command)
    } catch (error) {
        expect(error.name).toEqual('InvalidParameterValue');
    }

})


test('AMIDelete_AMIExist_Success', async () => {
    //given
    const input = {
        'ImageId': imageId,
    };
    const command = new DeregisterImageCommand(input);
    //when
    const response = await client.send(command);
    //getters are called directly in assertion below
    //then
    expect(response.$metadata.httpStatusCode).toEqual(200);
})

test('AMIDelete_AMINotExist_ThrowError', async () => {

    //given
    const input = {
        'ImageId': imageId,
    };
    const command = new DeregisterImageCommand(input);
    //when
    try {
        await client.send(command)
    } catch (error) {
        expect(error.name).toEqual('InvalidAMIID.Unavailable');
    }
})

