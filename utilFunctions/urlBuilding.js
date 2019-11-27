const server = require('../server')
//var grafanaBaseURL = 'http://207.182.129.92:3000/';
var grafanaBaseURL = 'http://localhost:3000/';
var apiKey = 'Bearer eyJrIjoieE04VnpiVFJkMzI5aFRlVk9ja0E3RVRCenRhVVZFZ3QiLCJuIjoiYW51cmFnIiwiaWQiOjF9';

function buildUrl(url, method, body) {
    if (server.grafanaBaseURL != undefined && server.grafanaBaseURL != "string")
        grafanaBaseURL = server.grafanaBaseURL;
    if (server.apiKey != undefined && server.apiKey != "string")
        apiKey = server.apiKey;

    var options = {
        method: method,
        url: grafanaBaseURL + url,
        headers: {
            "Authorization": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: body
    };
    return options;
}

exports.buildUrl = buildUrl;