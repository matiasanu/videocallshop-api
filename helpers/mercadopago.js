const mp = require('mercadopago');

mp.configure({
    sandbox: true,
});

const createPreference = () => {
    // https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post/
    // https://www.mercadopago.com.ar/developers/es/plugins_sdks/sdks/official/nodejs/#bookmark_uso
    const accessToken = generateToken();
};

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

module.exports = {
    createPreference,
};
