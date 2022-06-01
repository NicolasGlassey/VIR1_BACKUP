/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the SnapshotHelper Class
 */

"use strict";
const SnapshotHelper = require("../Snapshot/SnapshotHelper.js");

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
    snapshotName = 'snapshot-jest-1';
    volumeName = 'volumeName';

    //when
    await snapshotHelper.create(volumeName, snapshotName);

    //then
    expect(await snapshotHelper.exists(snapshotName).toBe(true));
})

test('create_SnapshotAlreadyExist_ThrowException', async () => {
    //given
    snapshotName = 'snapshot-jest-1';
    volumeName = 'volumeName';

    //when
    expect(() => await snapshotHelper.create(volumeName, name)).toThrow(SnapshotAlreadyExistException);

    //then
    //Exception thrown
})


test('create_VolumeNotExist_ThrowException', async () => {
    //given
    snapshotName = 'snapshot-jest-1';
    volumeName = 'volumeNameNotExist';

    //when
    expect(() => await snapshotHelper.create(volumeName, snapshotName)).toThrow(VolumeNotFoundException);

    //then
    //Exception thrown
})

test('snapshotDelete_SnapshotExist_Success', async () => {
    //given
    await snapshotHelper.create(volumeName, snapshotName);
    expect(await snapshotHelper.exists('snapshot-jest-4').toBe(true));

    //when
    await snapshotHelper.delete('snapshot-jest-4');

    //then
    expect(await snapshotHelper.exists('snapshot-jest-4').toBe(false));
})

test('SnapshotDelete_SnapshotNotExist_ThrowError', async () => {
    //given
    snapshotName = 'snapshot-jest-5';
    expect(await snapshotHelper.exists('snapshot-jest-4').toBe(false));

    //when
    expect(() => await snapshotHelper.delete(snapshotName)).toThrow(SnapshotNotFoundException);

    //then
    //Exception thrown
})
