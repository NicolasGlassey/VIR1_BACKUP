
"use strict";
const Dml = require("../dlm/dlmHelper");
const DlmCreationException = require("../dlm/exceptions/DlmCreationException");
const DlmAlreadyExistException = require("../dlm/exceptions/DlmAlreadyExistException");
const DlmDeleteException = require("../dlm/exceptions/DlmDeleteException");

let dml, dmlName,dmlId, actualResult, expectedResult, instanceName,role, type;

beforeAll(() => {
    dml = new Dml("eu-west-1");
    dmlName = "team-backup-dml-jest-1";
    role = "arn:aws:iam::709024702237:role/service-role/AWSDataLifecycleManagerDefaultRoleForAMIManagement";
    instanceName = "";
    actualResult = undefined;
    expectedResult = undefined;
    type = "ami";
    dmlId = "policy-072812b450c562509";
});

test('exists_DmlNotExist_Success', async () => {

    //given
    dmlName = "team-backup-dml-jest-1-not-exist";

    //when
    actualResult = await dml.exists(dmlId);

    //then
    expect(actualResult).toBe(false);
})

test('create_PolicyExist_Success', async () => {

    //given
    instanceName = "debian";

    //when
    await dml.create(dmlName,role,type, instanceName);

    //then
    expect(await dml.exists(amiName)).toBe(true);
})

test('delete_dmlExist_Success', async () => {

    //given
    expect(await dml.exists(dmlId)).toBe(true);

    // when
    await dml.delete(dmlId);

    //then
    expect(await dml.exists(dmlId)).toBe(false);
})


