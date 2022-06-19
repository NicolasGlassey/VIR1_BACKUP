"use strict";

const AmiHelper = require("../helpers/AmiHelper");
const { AwsCloudClientImpl } = require("vir1-core");
const AmiInvalidNumberException = require("../exceptions/ami/AmiInvalidNumberException.js").default;
const InstanceNotFoundException = require("../exceptions/instance/InstanceNotFoundException.js").default;
const AmiNotFoundException = require("../exceptions/ami/AmiNotFoundException.js").default;

const pluck = (arr, key) => arr.map(i => i[key]);

let ami, amiName, expectedResult, instanceName, awsCloudClientImpl;

beforeAll(async () => {
    ami = new AmiHelper('eu-west-3');
    await ami.deleteFromInstance('WINDOWS_INSTANCE');
    awsCloudClientImpl = await AwsCloudClientImpl.initialize('eu-west-3');
}, 10000);

test('create_ExistingInstanceName_Success', async () => {

    //given
    instanceName = "WINDOWS_INSTANCE";
    amiName = "team-backup-ami-jest-1";

    //when
    await ami.create(amiName, instanceName);

    //then
    expect(await awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, amiName)).toBe(true);
})

test('create_NonExistingInstanceName_ThrowException', async () => {

    // given
    instanceName = "team-backup-instance-not-exist";
    amiName = "team-backup-ami-jest-1";

    // when
    await expect(ami.create(amiName, instanceName)).rejects.toThrow(InstanceNotFoundException);

    // then
    // Exception thrown

})

test('delete_ExistingImage_Success', async () => {

    //given
    amiName = "team-backup-ami-jest-1";
    instanceName = "WINDOWS_INSTANCE";

    // create ami if not exists
    if (!await awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, amiName))
        await ami.create(amiName, instanceName);

    // when
    await ami.delete(amiName);

    //then
    expect(await awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, amiName)).toBe(false);
})

test('delete_NonExistingImage_ThrowException', async () => {

    //given
    amiName = "NON_EXISTING_AMI";

    // when
    expect(async () => await ami.delete(amiName)).rejects.toThrow(AmiNotFoundException);

    //then
    //Exception thrown
})

describe('IMAGE_ROTATION', () => {
    let numberOfAmis;
    beforeAll(async () => {
        let listAmiNames = [
            "team-backup-ami-jest-1",
            "team-backup-ami-jest-2",
            "team-backup-ami-jest-3"
        ]
        instanceName = "WINDOWS_INSTANCE";

        // Create AMIs for the test if they don't exist
        await Promise.all(listAmiNames.map(async (name) => { if (!await awsCloudClientImpl.exists(AwsCloudClientImpl.IMAGE, name)) await ami.create(name, instanceName); }));
    }, 10000);

    test('describeFromInstance_ExistingInstance_Success', async () => {

        //given
        instanceName = "WINDOWS_INSTANCE";
        expectedResult = [
            "team-backup-ami-jest-1",
            "team-backup-ami-jest-2",
            "team-backup-ami-jest-3"
        ];

        //when
        let result = await ami.describeFromInstance(instanceName);

        //then
        expect(result.length).toBe(3);

        // check if all amis are in the result
        expect(pluck(result, "Name").sort()).toEqual(expectedResult);
    });

    test('describeFromInstance_NonExistingInstance_ThrowException', async () => {

        //given
        instanceName = "non-existing-instance";

        //when
        await expect(ami.describeFromInstance(instanceName)).rejects.toThrow(InstanceNotFoundException);

        //then
        //Exception thrown
    })

    test('hasMoreThanXAmiFromInstance_NonExistingInstance_ThrowException', async () => {

        //given
        instanceName = "non-existing-instance";
        numberOfAmis = 3;

        //when
        await expect(ami.hasMoreThanXAmiFromInstance(instanceName, numberOfAmis)).rejects.toThrow(InstanceNotFoundException);

        //then
        //Exception thrown
    })

    test('hasMoreThanXAmiFromInstance_IncorrectNumber_ThrowException', async () => {

        //given
        instanceName = "WINDOWS_INSTANCE";
        numberOfAmis = "INCORRECT_NUMBER";

        //when
        await expect(ami.hasMoreThanXAmiFromInstance(instanceName, numberOfAmis)).rejects.toThrow(AmiInvalidNumberException);

        //then
        //Exception thrown
    })

    test('hasMoreThanXAmiFromInstance_LessThanNumberOfAmi_Success', async () => {

        //given
        instanceName = "WINDOWS_INSTANCE";
        numberOfAmis = 2;

        //when
        const result = await ami.hasMoreThanXAmiFromInstance(instanceName, numberOfAmis);

        //then
        expect(result).toBe(true);
    })

    test('hasMoreThanXAmiFromInstance_MoreThanNumberOfAmi_Success', async () => {

        //given
        instanceName = "WINDOWS_INSTANCE";
        numberOfAmis = 10;

        //when
        const result = await ami.hasMoreThanXAmiFromInstance(instanceName, numberOfAmis);

        //then
        expect(result).toBe(false);
    })

    test('deleteFromInstance_NonExistingInstance_ThrowException', async () => {

        //given
        instanceName = "non-existing-instance";
        expectedResult = [];

        //when
        await expect(ami.deleteFromInstance(instanceName)).rejects.toThrow(InstanceNotFoundException);

        //then
        //Exception thrown
    }, 10000);

    test('deleteFromInstance_ExistingInstance_Success', async () => {

        //given
        instanceName = "WINDOWS_INSTANCE";
        expectedResult = [];

        //when
        await ami.deleteFromInstance(instanceName);

        //then
        expect(await ami.describeFromInstance(instanceName)).toEqual(expectedResult);
    }, 10000);

})
