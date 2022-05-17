/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the AMI module
 */

"use strict";
const { EC2Client, CreateSnapshotCommand, DeleteSnapshotCommand } = require("@aws-sdk/client-ec2");
const Snapshot = require("../../src/snapshot/snapshot.js");

var client;

beforeAll(() => {
    client = new EC2Client({ region: "eu-west-3" });
    const snapshot = new Snapshot('snapshot-jest-2', 'snapshot created by jest',client);
});

test('SnapshotCreate_VolumeExist_Success', async () => {
    //given

    //when
    const result = snapshot.create('vol-0998fcb8329af98b2');
    const snapshotCreated = await Snapshot.find('snapshot-jest-2',client);

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(snapshotCreated.SnapshotId).toEqual(snapshot.SnapshotId);
})

test('SnapshotCreate_VolumeNotExist_ThowError', async () => {
    //given
    const volumeId = 'vol-0998fcb8329af9800';
    const expectedError = 'InvalidVolume.NotFound';
    let error = null;

    //when
    try {
        await snapshot.createSnapshot(volumeId);
    } catch (e) {
        error = e.name;
    }

    //then
    expect(error).toEqual(expectedError);

})

test('SnapshotDelete_SnapshotExist_Success', async () => {
    //given
    await snapshot.create('vol-0998fcb8329af98b2');

    //when
    const result = snapshot.delete();
    const snapshotDeleted = await Snapshot.find('snapshot-jest-2',client);

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(snapshotDeleted).toBeUndefined();

})

test('SnapshotDelete_SnapshotNotExist_ThowError', async () => {
    //given
    const snapshot.id = 'snap-05053c23e57d47411';
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
