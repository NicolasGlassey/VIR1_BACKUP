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
    snapshot = new Snapshot(clientRegionName);
});

test('SnapshotCreate_VolumeExist_Success', async () => {
    //given

    //when
    const result = await snapshot.create('vol-0998fcb8329af98b2', 'snapshot-jest-2', 'created by jest');
    const snapshotCreated = await Snapshot.exists('snapshot-jest-2');

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(snapshotCreated.SnapshotId).toEqual(snapshot.snapshot.SnapshotId);
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
    const result = snapshot.delete();
    const snapshotDeleted = await Snapshot.find('snapshot-jest-2');

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(snapshotDeleted).toBeUndefined();

})

test('SnapshotDelete_SnapshotNotExist_ThowError', async () => {
    //given
    const snapshotId = 'snap-05053c23e57d47411';

    snapshot.snapshot = { SnapshotId: snapshotId };

    const expectedError = 'InvalidSnapshot.NotFound';
    let error = null;
    //when
    try {
        await snapshot.delete();
    } catch (e) {
        error = e.name;
    }

    //then
    expect(error).toEqual(expectedError);
})
