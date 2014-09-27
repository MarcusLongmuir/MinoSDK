var request = require('request');
var crypt = require('./crypt');
var console = require('tracer').console();

function MDB(username, apiKey, platform_url) {
    this.username = username;
    this.api_key = apiKey;
    this.platform_url = platform_url || 'http://localhost:5002';
}

MDB.crypt = crypt;

MDB.prototype = {

    platform_request: function(endpoint, parameters, callback) {
        var sa = this;

        crypt.encrypt(JSON.stringify(parameters), sa.api_key, function(error, encrypted) {

            var options = {
                uri: sa.platform_url + "/api/" + endpoint,
                method: "POST",
                json: {
                    username: sa.username,
                    parameters: encrypted
                }
            };

            var with_response = function(error, response) {
                if (error != null) {
                    callback(error);
                } else {
                    crypt.decrypt(response.body, sa.api_key, function(error, decrypted) {
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
    },

    get_user_from_app_session: function(token, callback) {
        var sa = this;

        sa.platform_request("get_user_from_app_token", {
            app_token: token
        }, function(error, response) {
            callback(error, response);
        });
    }
}

module.exports = MDB;