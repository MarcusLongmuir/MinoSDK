var request = require('request');
var crypt = require('./crypt');
var console = require('tracer').console();

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

MinoSDK.prototype.platform_request = function(parameters, callback) {
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

MinoSDK.prototype.get_user_from_app_session = function(token, callback) {
    var sdk = this;

    sdk.platform_request("get_user_from_app_token", {
        app_token: token
    }, function(error, response) {
        callback(error, response);
    });
}

module.exports = MinoSDK;