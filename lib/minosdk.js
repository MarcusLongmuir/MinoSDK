var request = require('request');
var crypt = require('./crypt');
var logger = require('tracer').console();

function MinoSDK(username, apiKey, api_url) {
    this.username = username;
    this.api_key = apiKey;
    this.api_url = api_url || 'http://localhost:5002';
}

MinoSDK.crypt = crypt;

MinoSDK.prototype.set_local_api = function(minodb_api){
    var sdk = this;

    sdk.api = minodb_api;
};

MinoSDK.prototype.call = function(parameters, callback) {
    var sdk = this;

    if(sdk.api){
        sdk.api.call({
            "username": sdk.username,
        }, parameters, callback);
        return;
    }

    crypt.encrypt(JSON.stringify(parameters), sdk.api_key, function(error, encrypted) {

        var options = {
            uri: sdk.api_url + "/api/",
            method: "POST",
            json: {
                username: sdk.username,
                parameters: encrypted
            }
        };

        var with_response = function(error, response) {
            if (error != null) {
                callback(error);
            } else {
                crypt.decrypt(response.body, sdk.api_key, function(error, decrypted) {
                    var data;
                    try {
                        data = JSON.parse(decrypted);
                    } catch (e) {
                        callback(e);
                    }

                    if (data != null) {
                        callback(null, data);
                    }
                })
            }
        }

        request.post(options, with_response);
    });
};

MinoSDK.prototype.get = function(addresses, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"get",
            "parameters": {
                "addresses": addresses
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });
}

MinoSDK.prototype.search = function(addresses, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"search",
            "parameters": {
                "paths": addresses
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });
}

module.exports = MinoSDK;