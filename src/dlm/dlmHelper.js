
"use strict";
const { DLMClient, CreateLifecyclePolicyCommand } = require("@aws-sdk/client-dlm");
const DlmCreationException = require("./exceptions/DlmCreationException");
const DlmAlreadyExistException = require("./exceptions/DlmAlreadyExistException");
const DlmDeleteException = require("./exceptions/DlmDeleteException");

module.exports = class DLMClientHelper {

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
     * @param {*} name 
     * @returns 
     */
    async exists(name) {
        const policy = await this.find(name);
        return ami !== undefined;
    }


    /**
     * @brief This method is used to create an DLM from an instance.
     * @param {string} name : the name of the DLM to create. 
     * @param  {string} role : the role of the DLM to create.
     * @returns response : the response of the request.
     */
     async create(name, role) {

        if (await this.exists(name)) {
            throw new DlmAlreadyExistException('Dlm already exists');
        }

        //DML input
        const input = {
            'Description': 'DLM created by DLMHelper',            
            'ExecutionRoleArn': role,
            'PolicyDetails': {
                'PolicyType': 'EBS_SNAPSHOT_MANAGEMENT',
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
                    'Value': name
                }
            ]
        };
           
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
       async delete(policyId) {

         const command = new DeleteLifecyclePolicyCommand(policyId);
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