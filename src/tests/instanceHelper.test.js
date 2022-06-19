"use strict";

const InstanceHelper = require("../helpers/InstanceHelper");
const InstanceNotFoundException = require("../exceptions/instance/InstanceNotFoundException");
const { AwsCloudClientImpl } = require("vir1-core");

let instanceHelper, instanceName, expectedResult;

beforeAll(async () => {
    instanceHelper = new InstanceHelper('eu-west-3');
}, 10000);

test('instanceId_ExistingInstanceName_Success', async () => {

    // given
    instanceName = "WINDOWS_INSTANCE";

    // when
    const instanceId = await instanceHelper.instanceId(instanceName);

    // then
    expect(instanceId).not.toBeNull();

})

test('instanceId_NonExistingInstanceName_ThrowException', async () => {

    // given
    instanceName = "team-backup-instance-not-exist";

    // when
    await expect(instanceHelper.instanceId(instanceName)).rejects.toThrow(InstanceNotFoundException);

    // then
    // Exception thrown

})