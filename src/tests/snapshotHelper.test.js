/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the Snapshot module
 */

"use strict";
const SnapshotHelper = require("../Snapshot/SnapshotHelper.js");

var clientRegionName, snapshot;

beforeAll(() => {
    clientRegionName = "eu-west-3";
    snapshot = new SnapshotHelper(clientRegionName);
});

test('SnapshotCreate_VolumeExist_Success', async () => {
    //given
    const name = 'snapshot-jest-1';
    const id = 'vol-0998fcb8329af98b2';
    const description = 'created by jest';

    //when
    const result = await snapshot.create(id, name, description);
    const snapshotCreated = await snapshot.exists('snapshot-jest-1');

    //then

    expect(snapshotCreated).toBeTruthy();
})

test('SnapshotCreate_SnapshotAlreadyExist_Error', async () => {
    //given
    const name = 'snapshot-jest-2';
    const id = 'vol-0998fcb8329af98b2';
    const description = 'created by jest';
    const expectedError = 'Snapshot already exists';
    //when
    try {
        await snapshot.create(id, name, description);
    } catch (e) {
        error = e.message;
    }

    expect(error).toEqual(expectedError);
})


test('SnapshotCreate_VolumeNotExist_ThowError', async () => {
    //given
    const volumeId = 'vol-0998fcb8329af9800';
    const expectedError = 'InvalidVolume.NotFound';
    let error = null;

    //when
    try {
        await snapshot.create(volumeId, 'snapshot-jest-3', 'created by jest');
    } catch (e) {
        error = e.name;
    }

    //then
    expect(error).toEqual(expectedError);

})

test('SnapshotDelete_SnapshotExist_Success', async () => {
    //given
    await snapshot.create('vol-0998fcb8329af98b2', 'snapshot-jest-4', 'created by jest');

    //when
    const result = await snapshot.delete('snapshot-jest-4');
    const snapshotDeleted = await snapshot.exists('snapshot-jest-4');

    //then
    expect(snapshotDeleted).toBeFalsy();

})

test('SnapshotDelete_SnapshotNotExist_ThowError', async () => {
    //given
    const snapshotName = 'snapshot-jest-5';

    const expectedError = 'Snapshot not exist';
    let error = null;
    //when
    try {
        await snapshot.delete(snapshotName);
    } catch (e) {
        error = e.message;
    }

    //then
    expect(error).toEqual(expectedError);
})
