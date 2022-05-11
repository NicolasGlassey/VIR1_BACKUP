/**
 * Author : Anthony Bouillant
 * Date : 11.02.2022
 * Description : Test the AMI module
 */

"use strict";

// import { EC2Client, CreateImageCommand } from "@aws-sdk/client-ec2"; // ES Modules import
const { EC2Client, CreateImageCommand } = require("@aws-sdk/client-ec2");
const client = new EC2Client({ region: "eu-west-3" });


test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {

    /** input parameters */
    const input = {
        'InstanceId': 'i-04199df6d81374547',
        'Name': 'ami-test-17',
    };

    const command = new CreateImageCommand(input);
    const response = await client.send(command);

    expect(response.$metadata.httpStatusCode).toEqual(200);
})

test('AMICreate_InstanceNotExist_ThrowErrorInvalidParameterValue', () => {
    //given
    //when
    //getters are called directly in assertion below
    //then
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