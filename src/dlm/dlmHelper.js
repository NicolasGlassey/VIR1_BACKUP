
"use strict";
const { DLMClient, CreateLifecyclePolicyCommand } = require("@aws-sdk/client-dlm");

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

 
    // #endregion

    // #region Private methods
    // #endregion
}