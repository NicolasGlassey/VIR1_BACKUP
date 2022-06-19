/**
 * Author : Hélène Dubuis
 * Date : 12.05.2022
 * Description : Test the SnapshotHelper Class
 */

"use strict";
const SnapshotNotFound = require("../exceptions/snapshot/SnapshotNotFoundException");
const SnapshotAlreadyExist = require("../exceptions/snapshot/SnapshotAlreadyExistException");
const SnapshotVolumeNotFound = require("../exceptions/snapshot/SnapshotVolumeNotFoundException");
const SnapshotHelper = require("../helpers/SnapshotHelper");

let clientRegionName, snapshotHelper;
let snapshotName, volumeName;


beforeAll(async () => {
    clientRegionName = "eu-west-3";
    snapshotHelper = new SnapshotHelper(clientRegionName);
    snapshotName = "";
    volumeName = "";
    let listSnapshotsNames = [
        "snapshot-jest-1",
        "snapshot-jest-6",
        "snapshot-jest-7"
    ]
    //await Promise.all(listAmiNames.map(async (name) => { await snapshotHelper.create('jspasjd', name); }));
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
test('exist_AllSnapshot_Success', async () => {
    //given
    volumeName = 'jspasjd';
    //when
    const result = await snapshotHelper.findAllByVolume(volumeName);
    //then
    expect(result.length).toBe(1);
}
)
test('exist_AllSnapshot_ThrowException', async () => {
    //given
    volumeName = 'volumeNameNotExist';
    //when
    expect(async ()=> await snapshotHelper.findAllByVolume(volumeName)).rejects.toThrow(SnapshotVolumeNotFound);
    //then
    //Exception thrown
}
)
test('hasMoreThanXSnapshotFromVolume_LessThanNumberOfSnapshot_Success', async () => {

    //given
    volumeName = "jspasjd";
    let numberOfSanpshot = 0;

    //when
    const result = await snapshotHelper.hasMoreThanXSnapshotFromVolume(volumeName, numberOfSanpshot);

    //then
    expect(result).toBe(true);
})
test('hasMoreThanXSnapshotFromVolume_MoreThanNumberOfSnapshot_Success', async () => {

    //given
    volumeName = "jspasjd";
    let numberOfSanpshot = 10;

    //when
    const result = await snapshotHelper.hasMoreThanXSnapshotFromVolume(volumeName, numberOfSanpshot);

    //then
    expect(result).toBe(false);
})

test('delete_AllSnapshotByVolume_Success', async()=>{
    //given
    volumeName= 'jspasjd';
    
    //when
    await snapshotHelper.deleteAllByVolume(volumeName);
    
    //then
    expect(await snapshotHelper.findAllByVolume(volumeName)).toEqual([]);


})
test('delete_AllSnapshotByVolume_ThrowException', async()=>{
    //given
    volumeName= 'volumeNameNotExist';
    
    //when
    expect(async ()=> await snapshotHelper.deleteAllByVolume(volumeName)).rejects.toThrow(SnapshotNotFound);
    //then
    //Exception thrown


})
test('delete_SnapshotExist_Success', async () => {
    //given
    snapshotName = 'snapshot-jest-1';
    volumeName = 'jspasjd';

    expect(await snapshotHelper.exists(snapshotName)).toBe(true);

    //when
    await snapshotHelper.delete(snapshotName);

    //then
    expect(await snapshotHelper.exists(snapshotName)).toBe(false);
})

test('delete_SnapshotNotExist_ThrowError', async () => {
    //given
    snapshotName = 'snapshot-jest-5';
    expect(await snapshotHelper.exists('snapshot-jest-5')).toBe(false);

    //when
    expect(async () => await snapshotHelper.delete(snapshotName)).rejects.toThrow(SnapshotNotFound);

    //then
    //Exception thrown
})



