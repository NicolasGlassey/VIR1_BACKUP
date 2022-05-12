/**
 * Author : Anthony Bouillant
 * Date : 11.02.2022
 * Description : Test the AMI module
 */

"use strict";
const { EC2Client, CreateImageCommand } = require("@aws-sdk/client-ec2");

var client;

beforeAll(() => {
    client = new EC2Client({ region: "eu-west-3" });
});

test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {
    /** input parameters */
    const input = {
        'InstanceId': 'i-04199df6d81374547',
        'Name': 'ami-jest-1',
        'Description': 'ami created by jest',
    };

    const command = new CreateImageCommand(input);
    const response = await client.send(command);

    expect(response.$metadata.httpStatusCode).toEqual(200);
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

test('AMIDelete_AMINotExist_ThrowError', () => {
    //given
    //when
    //getters are called directly in assertion below
    //then
})

test('AMIDelete_AMIExist_Success', () => {
    //given
    //when
    //getters are called directly in assertion below
    //then
})