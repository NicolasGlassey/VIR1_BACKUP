/**
 * @file      ami.test.js
 * @brief     This file contains the unit tests for the Ami class.
 * @author    Created by Anthony Bouillant
 * @url       https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
 */

"use strict";
const Ami = require("../ami/AmiHelper");
const AmiNumberException = require("../exceptions/ami/AmiNumberException");
const InstanceNotFoundException = require("../ami/exceptions/InstanceNotFoundException.js").default;
const AmiNotFoundException = require("../ami/exceptions/AmiNotFoundException.js").default;

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

    let listAmiName = [
        "team-backup-ami-jest-1",
        "team-backup-ami-jest-2",
        "team-backup-ami-jest-3"
    ];

    // Create AMIs for the test
    await Promise.all(listAmiName.map(async (amiName) => { if (!await ami.exists(amiName)) await ami.create(amiName, instanceName); }));

    //when
    let list = await ami.allFromSpecificInstance(instanceName);

    //then
    expect(list.length).toBe(3);
});

test('allFromSpecificInstance_NonExistingInstance_ThrowException', async () => {

    //given
    instanceName = "non-existing-instance";

    //when
    await expect(ami.allFromSpecificInstance(instanceName)).rejects.toThrow(InstanceNotFoundException);
})

test('deleteAllFromSpecificInstance_ExistingInstance_Success', async () => {

    //given
    instanceName = "WINDOWS_INSTANCE";
    expectedResult = [];

    //when
    await ami.deleteAllFromSpecificInstance(instanceName);

    //then
    expect(await ami.allFromSpecificInstance(instanceName)).toEqual(expectedResult);
})

test('deleteAllFromSpecificInstance_NonExistingInstance_Success', async () => {

    //given
    instanceName = "non-existing-instance";
    expectedResult = [];

    //when
    await expect(ami.deleteAllFromSpecificInstance(instanceName)).rejects.toThrow(InstanceNotFoundException);
})

test('hasMoreAmiThan_NonExistingInstance_ThrowException', async () => {
    //given
    instanceName = "non-existing-instance";
    const numberOfAmi = 3;

    //when
    await expect(ami.hasMoreAmiThan(numberOfAmi, instanceName)).rejects.toThrow(InstanceNotFoundException);
})

test('hasMoreAmiThan_IncorrectNumber_ThrowException', async () => {
    //given
    instanceName = "WINDOWS_INSTANCE";
    const incorrectNumber = 'INCORRECT_NUMBER';

    //when
    await expect(ami.hasMoreAmiThan(incorrectNumber, instanceName)).rejects.toThrow(AmiNumberException);
})

test('hasMoreAmiThan_LessThanNumberOfAmi_Success', async () => {
    //given
    instanceName = "WINDOWS_INSTANCE";
    let numberOfAmi = 2;
    let listAmiName = [
        "team-backup-ami-jest-1",
        "team-backup-ami-jest-2",
        "team-backup-ami-jest-3"
    ];

    // Create AMIs for the test
    await Promise.all(listAmiName.map(async (amiName) => { if (!await ami.exists(amiName)) await ami.create(amiName, instanceName); }));

    //when
    let list = await ami.hasMoreAmiThan(numberOfAmi, instanceName);

    //then
    expect(list).toBe(true);
})

test('hasMoreAmiThan_MoreThanNumberOfAmi_Success', async () => {
    instanceName = "WINDOWS_INSTANCE";
    let numberOfAmi = 10;
    let listAmiName = [
        "team-backup-ami-jest-1",
        "team-backup-ami-jest-2",
        "team-backup-ami-jest-3"
    ];

    // Create AMIs for the test
    await Promise.all(listAmiName.map(async (amiName) => { if (!await ami.exists(amiName)) await ami.create(amiName, instanceName); }));

    //when
    let list = await ami.hasMoreAmiThan(numberOfAmi, instanceName);

    //then
    expect(list).toBe(false);
})
