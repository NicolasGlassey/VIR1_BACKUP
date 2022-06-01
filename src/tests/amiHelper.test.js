/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 */

"use strict";
const Ami = require("../ami/AmiHelper.js");

let ami;
let amiName;

beforeAll(() => {
    ami = new Ami("eu-west-3");
    amiName = "team-backup-ami-jest-1";
});

test('exists_AmiExist_Success', async () => {

    //given
    //refer to beforeAll
    let actualResult;
    let expectedResult = true;

    //when
    actualResult = await ami.exists(amiName);

    //then
    expect(actualResult.toBe(expectedResult));
})

test('exists_AmiNotExist_Success', async () => {

    //given
    //refer to beforeAll
    let actualResult;
    let expectedResult = false;

    //when
    actualResult = await ami.exists(amiName);

    //then
    expect(actualResult.toBe(expectedResult));
})

test('create_InstanceExist_Success', async () => {

    //given
    let instanceName = "team-backup-instance-for-ami";

    //when
    await ami.create(amiName, instanceName);

    //then
    expect(await ami.exists(amiName).toBe(true));
})

test('create_InstanceNotExist_ThrowException', async () => {

    // given
    let instanceName = "team-backup-instance-not-exist";

    // when
    expect(() => await ami.create(amiName, instanceName)).toThrow(InstanceNotFoundException);

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

