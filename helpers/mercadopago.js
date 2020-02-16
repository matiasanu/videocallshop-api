const mp = require('mercadopago');
const fetch = require('node-fetch');

const createPreference = (accessToken, items, externalReference) => {
    mp.configurations.setAccessToken(accessToken);

    //const accessToken = generateToken();
    const preferenceOptions = {
        external_reference: externalReference,
        items,
    };

    return mp.preferences.create(preferenceOptions);
};

const getAuthorizationUrl = (store, protocol, host) => {
    return `https://auth.mercadopago.com.ar/authorization?client_id=${store.mercadopagoClientId}&APP_ID=${process.env.MERCADOPAGO_MARKETPLACE_APP_ID}&response_type=code&platform_id=mp&redirect_uri=https://${host}/mercadopago/store-authorization-code?storeId=${store.storeId}`;
};

const createStoreAccessTokenByAuthorizationCode = async (
    code,
    host,
    storeId
) => {
    const params = {
        client_id: process.env.MERCADOPAGO_MARKETPLACE_APP_ID,
        client_secret: process.env.MERCADOPAGO_MARKETPLACE_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `https://${host}/mercadopago/store-authorization-code?storeId=${storeId}`,
    };

    return fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
        },
    }).then(res => res.json());
};

module.exports = {
    createPreference,
    getAuthorizationUrl,
    createStoreAccessTokenByAuthorizationCode,
};
