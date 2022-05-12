/**
 * Author : Anthony Bouillant
 * Date : 11.02.2022
 * Description : Test the AMI module
 */

"use strict";
const { EC2Client } = require("@aws-sdk/client-ec2");
const Ami = require("../ami/Ami.js");

var client, ami;
const amiName = "ami-jest-1";

beforeAll(() => {
    client = new EC2Client({ region: "eu-west-3" });
    ami = new Ami(client);
});

test('AMICreate_InstanceExist_RecivedAnAMIID', async () => {

    // given
    const instanceId = "i-04199df6d81374547";

    // when
    const result = await ami.create(amiName, instanceId);
    const findAmi = await ami.find(amiName);

    // then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(findAmi.ImageId).toEqual(ami.ami.ImageId);
})

test('AMICreate_InstanceNotExist_ThrowInvalidInstanceIDNotFound', async () => {

    // given
    const instanceId = "i-04199df6d81374949";
    const expectedError = 'InvalidInstanceID.NotFound';
    let error = null;

    // when
    try { await ami.create(amiName, instanceId); } catch (e) { error = e.name; }

    // then
    expect(error).toEqual(expectedError);

})

test('AMICreate_InstanceNotExist_ThrowErrorInvalidParameterValue', async () => {
    // given
    const instanceId = "i-04199df6d8137494zZ";
    const expectedError = 'InvalidParameterValue';
    let error = null;

    // when
    try { await ami.create(amiName, instanceId); } catch (e) { error = e.name; }

    // then
    expect(error).toEqual(expectedError);

})


test('AMIDelete_AMIExist_Success', async () => {
    //given
    const image = await ami.find(amiName);

    // when
    const result = await ami.delete(image.ImageId);
    const notFindAmi = await ami.find(amiName);

    //then
    expect(result.$metadata.httpStatusCode).toEqual(200);
    expect(notFindAmi).toBeUndefined();
})

// test('AMIDelete_AMINotExist_ThrowError', async () => {

//     //given
//     const input = {
//         'ImageId': imageId,
//     };
//     const command = new DeregisterImageCommand(input);
//     //when
//     try {
//         await client.send(command)
//     } catch (error) {
//         expect(error.name).toEqual('InvalidAMIID.Unavailable');
//     }
// })

