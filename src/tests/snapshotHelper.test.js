/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the SnapshotHelper Class
 */

"use strict";
const SnapshotNotFound = require("../snapshot/exceptions/SnapshotNotFoundException");
const SnapshotAlreadyExist = require("../snapshot/exceptions/SnapshotAlreadyExistException");
const SnapshotVolumeNotFound = require("../snapshot/exceptions/SnapshotVolumeNotFoundException");
const SnapshotHelper = require("../snapshot/SnapshotHelper");

let clientRegionName, snapshotHelper;
let snapshotName, volumeName;
jest.setTimeout('10000');


beforeAll(async () => {
    clientRegionName = "eu-west-3";
    snapshotHelper = new SnapshotHelper(clientRegionName);
    snapshotName = "";
    volumeName = "";
    await snapshotHelper.create('jspasjd', 'snapshot-jest-1');
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
    volumeName = 'jspasjd';

    //when

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(true);
})

test('create_SnapshotAlreadyExist_ThrowException', async () => {
    //given
    snapshotName = 'snapshot-jest-1';
    volumeName = 'jspasjd';

    //when

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
    snapshotName = 'snapshot-jest-1';
    volumeName = 'jspasjd';

    expect(await snapshotHelper.exists(snapshotName)).toBe(true);

    //when
    await snapshotHelper.delete(snapshotName);

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(false);
})

test('SnapshotDelete_SnapshotNotExist_ThrowError', async () => {
    //given
    snapshotName = 'snapshot-jest-5';
    expect(await snapshotHelper.exists('snapshot-jest-5')).toBe(false);

    //when
    expect(async () => await snapshotHelper.delete(snapshotName)).rejects.toThrow(SnapshotNotFound);

    //then
    //Exception thrown
})
//test find all snapshot of a volume
test('findAll_SnapshotExist_Success', async () => {
    //given
    volumeName = 'jspasjd';
    //when
    const result = await snapshotHelper.findAllByVolume(volumeName);
    //then
    expect(result.length).toBe(3);
}
)
