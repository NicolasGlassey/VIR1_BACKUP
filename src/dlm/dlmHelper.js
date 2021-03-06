//for more information,
//https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dlm/index.html

"use strict";
const { DLMClient, CreateLifecyclePolicyCommand, DeleteLifecyclePolicyCommand, GetLifecyclePoliciesCommand } = require("@aws-sdk/client-dlm");
const DlmCreationException = require("./exceptions/DlmCreationException");
const DlmAlreadyExistException = require("./exceptions/DlmAlreadyExistException");
const DlmDeleteException = require("./exceptions/DlmDeleteException");
const DlmNotFoundException = require("./exceptions/DlmNotFoundException");

module.exports = class Dml {

    // #region Private members
    #client;
    // #endregion

    // #region Public members
    /**
     * @brief This method constructs an Ami object.
     * @param {DLMClient} client : the client used to communicate with the AWS API. 
     */
    constructor(regionName) {
        this.#client = new DLMClient({ region: regionName });
    }


    /**
     * This method is used to check if an Policy exists.
     * @param {*} dmlId 
     * @returns 
     */
    async exists(dmlId) {
        const input = {
            'PolicyIds': [dmlId]
        };
        const command = new GetLifecyclePoliciesCommand(input);
        let response;
        try {
            response = await this.#client.send(command);
        } catch (error) {
            throw new DlmNotFoundException('Dlm not found');
        }
      return response.Policies.length > 0;
    }

    async find(name) {
        //todo
    }

    /**
     * @brief This method is used to create an DLM from an instance.
     * @param {string} name : the name of the DLM to create. 
     * @param  {string} role : the role of the DLM to create.
     * @returns response : the response of the request.
     */
     async create(name, role, type, instanceName) {

        if (await this.exists(name)) {
            throw new DlmAlreadyExistException('Dlm already exists');
        }

        //most of policyDetails params are optional
        //https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dlm/modules/policydetails.html

        const input = {
            'Name': name,
            'Description': 'DLM created by DLMHelper',            
            'ExecutionRoleArn': role,
            'PolicyDetails': {
                'PolicyType': 'VOLUME_SNAPSHOT',
                'ResourceType': type=='sna'?'AMI':'VOLUME',
                'Schedule': {
                    'Frequency': 'Weekly',
                    'StartTime': '08:00',
                    'Timezone': 'UTC'
                },
                'RetentionRules': [
                    {
                        'RetainRule': {
                            'Count': 10,
                            'Interval': 'Weekly'
                        }
                    }
                ]
            },
            'State': 'ENABLED',
            'Tags': [
                {
                    'Key': 'Name',
                    'Value': instanceName
                }
            ]
        };
        console.log(input);
     
           
         // Create the Policy
         const command = new CreateLifecyclePolicyCommand(input);
         let response;
         try {
             response = await this.#client.send(command);
         } catch (error) {
             throw new DlmCreationException('Dlm creation failed');
         }
        return response;
    }

      /**
     * @brief This method is used to delete an DML.
     * @param {string} policyId : the id of the DML to delete.
     * @returns response : the response of the request.
     */
       async delete(dmlId) {
        const input = {
            'PolicyIds': [dmlId]
        };

         const command = new DeleteLifecyclePolicyCommand(input);
         let response;
         try {
             response = await this.#client.send(command);
         } catch (error) {
             throw new DlmDeleteException('Dlm delete failed');
         }
        return response;
    }

   // #region Private methods
   // #endregion

}