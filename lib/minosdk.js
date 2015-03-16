var request = require('request');
var crypt = require('./crypt');
var logger = require('tracer').console();

function MinoSDK(username, api_key, api_url) {
    var sdk = this;

    sdk.username = username;
    sdk.api_key = api_key;
    sdk.api_url = api_url || 'http://localhost:5002';
    sdk.api = null;//Local api instance
}

MinoSDK.crypt = crypt;

MinoSDK.prototype.set_local_api = function(minodb_api){
    var sdk = this;

    sdk.api = minodb_api;

    return sdk;
};

MinoSDK.prototype.with_user = function(username, api_key){
    var sdk = this;

    var new_sdk = new MinoSDK(username, api_key, sdk.api_url);
    new_sdk.api = sdk.api;

    return new_sdk;
}

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

    return sdk;
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

    return sdk;
}

MinoSDK.prototype.save = function(objects, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"save",
            "parameters": {
                "objects": objects
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });

    return sdk;
}

MinoSDK.prototype.save_type = function(type, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"save_type",
            "parameters": {
                "type": type
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });

    return sdk;
}

MinoSDK.prototype.create_user = function(user, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"create_user",
            "parameters": {
                "user": user
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });

    return sdk;
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

    return sdk;
}

MinoSDK.prototype.delete = function(addresses, callback) {
    var sdk = this;

    sdk.call(
        {
            "function":"delete",
            "parameters": {
                "addresses": addresses
            }
        },
    function(error, response) {
        logger.log(error,response);
        callback(error, response);
    });

    return sdk;
}

module.exports = MinoSDK;