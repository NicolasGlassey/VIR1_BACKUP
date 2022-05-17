/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 */

"use strict";
const { EC2Client } = require("@aws-sdk/client-ec2");
const Ami = require("../ami/Ami.js");

var client, ami;
const amiName = "ami-jest-1";

beforeAll(() => {
    client = new EC2Client({ region: "eu-west-3" });
    ami = new Ami(client);
});

test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {

    // given
    const instanceId = "i-04199df6d81374547";

    // when
    const result = await ami.create(amiName, instanceId);
    const findAmi = await Ami.find(amiName, client);

    // then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(findAmi.ImageId).toEqual(ami.ami.ImageId);
})

test('AMICreate_InstanceNotExist_ThrowInvalidInstanceIDNotFound', async () => {

    // given
    const instanceId = "i-04199df6d81374949";
    const expectedError = 'InvalidInstanceID.NotFound';
    let error = null;

    // when
    try { await ami.create(amiName, instanceId); } catch (e) { error = e.name; }

    // then
    expect(error).toEqual(expectedError);

})

test('AMICreate_InstanceNotExist_ThrowErrorInvalidParameterValue', async () => {
    // given
    const instanceId = "i-04199df6d8137494zZ";
    const expectedError = 'InvalidParameterValue';
    let error = null;

    // when
    try { await ami.create(amiName, instanceId); } catch (e) { error = e.name; }

    // then
    expect(error).toEqual(expectedError);

})


test('AMIDelete_AMIExist_Success', async () => {
    //given
    const image = await Ami.find(amiName, client);

    // when
    const result = await ami.delete();
    const notFindAmi = await Ami.find(amiName, client);

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200); // 200 = OK
    expect(image).not.toEqual(notFindAmi); // image cannot be found
})

test('AMIDelete_AMINotExist_ThrowError', async () => {
    //given
    const imageId = 'ami-063e9f7d72b668f54';

    ami.ami = { "ImageId": imageId }

    const expectedError = 'InvalidAMIID.NotFound';
    let error = null;

    // when
    try { await ami.delete(); } catch (e) { error = e.name; }

    // then
    expect(error).toEqual(expectedError);
})

