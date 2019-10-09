const mp = require('mercadopago');

const createPreference = (accessToken, items, externalReference) => {
    // https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post/
    // https://www.mercadopago.com.ar/developers/es/plugins_sdks/sdks/official/nodejs/#bookmark_uso

    // ToDo: promote this to be productive
    mp.configure({
        sandbox: true,
        access_token: accessToken,
    });

    //const accessToken = generateToken();
    const preferenceOptions = {
        external_reference: externalReference,
        items,
    };

    return mp.preferences.create(preferenceOptions);
};

/*
const generateToken = () => {
    return new Promise((resolve, reject) => {
        mp.getAccessToken(function(err, accessToken) {
            if (err) {
                reject(err);
            } else {
                resolve(accessToken);
            }
        });
    });
};
*/

module.exports = {
    createPreference,
};
