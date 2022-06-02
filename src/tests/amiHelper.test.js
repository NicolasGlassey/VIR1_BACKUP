/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";
const Ami = require("../ami/AmiHelper.js").default;

let ami, amiName, actualResult, expectedResult, instanceName;

beforeAll(() => {
    ami = new Ami("eu-west-3");
    amiName = "team-backup-ami-jest-1";
    instanceName = "";
    actualResult = undefined;
    expectedResult = undefined;
});

test('exists_AmiExist_Success', async () => {

    //given

    //when
    actualResult = await ami.exists(amiName);

    //then
    expect(actualResult.toBe(true));
})

test('exists_AmiNotExist_Success', async () => {

    //given

    //when
    actualResult = await ami.exists(amiName);

    //then
    expect(actualResult.toBe(false));
})

test('create_InstanceExist_Success', async () => {

    //given
    instanceName = "team-backup-instance-for-ami";

    //when
    await ami.create(amiName, instanceName);

    //then
    expect(await ami.exists(amiName).toBe(true));
})

test('create_InstanceNotExist_ThrowException', async () => {

    // given
    instanceName = "team-backup-instance-not-exist";

    // when
    expect(() => await ami.create(amiName, instanceName)).toThrow('InstanceNotFoundException');

    // then
    // Exception thrown

})

test('delete_AmiExist_Success', async () => {

    //given
    expect(await ami.exists(amiName).toBe(true));

    // when
    await ami.delete(amiName);

    //then
    expect(await ami.exists(amiName).toBe(false));
})

test('delete_AmiNotExist_ThrowException', async () => {

    //given
    expect(await ami.exists(amiName).toBe(true));

    // when
    expect(() => await ami.delete(amiName)).toThrow(AmiNotFoundException);

    //then
    //Exception thrown
})

