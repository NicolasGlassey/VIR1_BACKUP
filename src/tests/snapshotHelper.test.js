/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the SnapshotHelper Class
 */

"use strict";
const SnapshotNotFound = require("../Snapshot/exceptions/SnapshotNotFound");
const SnapshotAlreadyExist = require("../Snapshot/exceptions/SnapshotAlreadyExist");
const SnapshotVolumeNotFound = require("../Snapshot/exceptions/SnapshotVolumeNotFound");
const SnapshotHelper = require("../Snapshot/SnapshotHelper");

let clientRegionName, snapshotHelper;
let snapshotName, volumeName;

beforeAll(() => {
    clientRegionName = "eu-west-3";
    snapshotHelper = new SnapshotHelper(clientRegionName);
    snapshotName = "";
    volumeName = "";
});

test('exist_SnapshotExist_Success', async () => {
    //given
    snapshotName = 'snapshot-jest-1';

    //when
    //event directly called in the assertion

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(true);
})

test('exist_SnapshotNotExist_Success', async () => {
    //given
    snapshotName = 'snapshot-jest-X';

    //when
    //event directly called in the assertion

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(false);
})

test('create_VolumeExist_Success', async () => {
    //given
    snapshotName = 'snapshot-jest-2';
    volumeName = 'jspasjd';

    //when
    await snapshotHelper.create(volumeName, snapshotName);

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(true);
})

test('create_SnapshotAlreadyExist_ThrowException', async () => {
    //given
    snapshotName = 'snapshot-jest-3';
    volumeName = 'jspasjd';

    //when
    await snapshotHelper.create(volumeName, snapshotName);

    expect(async () => await snapshotHelper.create(volumeName, snapshotName)).rejects.toThrow(SnapshotAlreadyExist);
    //then
    //Exception thrown
})


test('create_VolumeNotExist_ThrowException', async () => {
    //given
    snapshotName = 'snapshot-jest-2';
    volumeName = 'volumeNameNotExist';

    //when
    expect(async () => await snapshotHelper.create(volumeName, snapshotName)).rejects.toThrow(SnapshotVolumeNotFound);

    //then
    //Exception thrown
})

test('snapshotDelete_SnapshotExist_Success', async () => {
    //given
    snapshotName = 'snapshot-jest-4';
    volumeName = 'jspasjd';
    await snapshotHelper.create(volumeName, snapshotName);
    expect(await snapshotHelper.exists('snapshot-jest-4')).toBe(true);

    //when
    await snapshotHelper.delete('snapshot-jest-4');

    //then
    expect(await snapshotHelper.exists('snapshot-jest-4')).toBe(false);
})

test('SnapshotDelete_SnapshotNotExist_ThrowError', async () => {
    //given
    snapshotName = 'snapshot-jest-5';
    expect(await snapshotHelper.exists('snapshot-jest-4')).toBe(false);

    //when
    expect(async () => await snapshotHelper.delete(snapshotName)).rejects.toThrow(SnapshotNotFound);

    //then
    //Exception thrown
})
