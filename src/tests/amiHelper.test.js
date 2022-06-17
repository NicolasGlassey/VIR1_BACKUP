/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";
const Ami = require("../ami/AmiHelper");
const InstanceNotFoundException = require("../ami/exceptions/InstanceNotFoundException.js").default;
const AmiNotFoundException = require("../ami/exceptions/AmiNotFoundException.js").default;
const AmiAlreadyExistException = require("../ami/exceptions/AmiAlreadyExistException.js").default;
const AmiCreationException = require("../ami/exceptions/AmiCreationException.js").default;

let ami, amiName, actualResult, expectedResult, instanceName;

beforeAll(() => {
    ami = new Ami("eu-west-3");
    amiName = "team-backup-ami-jest-1";
    instanceName = "";
    actualResult = undefined;
    expectedResult = undefined;
});

test('exists_AmiNotExist_Success', async () => {

    //given
    amiName = "team-backup-ami-jest-1-not-exist";

    //when
    actualResult = await ami.exists(amiName);

    //then
    expect(actualResult).toBe(false);
})

test('create_InstanceExist_Success', async () => {

    //given
    instanceName = "WINDOWS_INSTANCE";

    //when
    await ami.create(amiName, instanceName);

    //then
    expect(await ami.exists(amiName)).toBe(true);
})

test('create_InstanceNotExist_ThrowException', async () => {

    // given
    instanceName = "team-backup-instance-not-exist";

    // when
    expect(async () => await ami.create(amiName, instanceName)).rejects.toThrow(InstanceNotFoundException);

    // then
    // Exception thrown

})

test('delete_AmiExist_Success', async () => {

    //given
    expect(await ami.exists(amiName)).toBe(true);

    // when
    await ami.delete(amiName);

    //then
    expect(await ami.exists(amiName)).toBe(false);
})

test('delete_AmiNotExist_ThrowException', async () => {

    //given

    // when
    expect(async () => await ami.delete(amiName)).rejects.toThrow(AmiNotFoundException);

    //then
    //Exception thrown
})

test('allFromSpecificInstance_ExistingInstance_Success', async () => {

    //given
    instanceName = "WINDOWS_INSTANCE";

    //when
    let list = await ami.allFromSpecificInstance(instanceName);

    //then
    expect(list.length).toBeGreaterThan(0);
})

test('allFromSpecificInstance_NonExistingInstance_ThrowException', async () => {

    //given
    instanceName = "non-existing-instance";

    //when
    await expect(ami.allFromSpecificInstance(instanceName)).rejects.toThrow(InstanceNotFoundException);
})

