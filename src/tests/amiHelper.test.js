/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 */

"use strict";
const { EC2Client } = require("@aws-sdk/client-ec2");
const Ami = require("../ami/AmiHelper.js");

var ami;
const amiName = "ami-jest-1";

beforeAll(() => {
    ami = new Ami("eu-west-3");
});

test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {

    // given
    const instanceId = "i-04199df6d81374547";
    //when
    const result = await ami.create(amiName, instanceId);
    const amiCreated = await ami.exists('ami-jest-1');

    //then

    expect(amiCreated).toBeTruthy();
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

    // when
    const result = await ami.delete(amiName);
    const amiDeleted = await ami.exists(amiName);

    //then
    expect(amiDeleted).toBeFalsy();

})

test('AMIDelete_AMINotExist_ThrowError', async () => {

    const expectedError = 'Ami not exist';
    let error = null;

    // when
    try { await ami.delete(amiName); } catch (e) { error = e.message; }

    // then
    expect(error).toEqual(expectedError);
})

