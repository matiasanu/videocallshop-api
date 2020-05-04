'use strict';

async function sendPushNotification(
    message,
    players,
    oneSignalAppId,
    oneSignalRestApiKey,
    data
) {
    var headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${oneSignalRestApiKey}`,
    };

    console.log(
        '::::::::: ONESIGNAL_REST_API_KEY',
        oneSignalAppId,
        oneSignalRestApiKey
    );

    var options = {
        host: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: headers,
    };

    var data = {
        app_id: oneSignalAppId,
        contents: { en: message },
        data,
        include_player_ids: players,
    };

    var https = require('https');
    var req = https.request(options, function(res) {
        res.on('data', function(data) {
            console.log('Response:');
            console.log(JSON.parse(data));
        });
    });

    req.on('error', function(e) {
        console.log('ERROR:');
        console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
}

module.exports = {
    sendPushNotification,
};
