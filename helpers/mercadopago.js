const mp = require('mercadopago');
const fetch = require('node-fetch');

const createPreference = (
    accessToken,
    clientId,
    clientSecret,
    items,
    externalReference
) => {
    // https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post/
    // https://www.mercadopago.com.ar/developers/es/plugins_sdks/sdks/official/nodejs/#bookmark_uso

    let mpOptions = {};
    // check if mercadopago is in productive or sandbox mode
    if (process.env.MERCADOPAGO_SANDBOX === 'TRUE') {
        //sandbox
        mpOptions.sandbox = true;
        mpOptions.access_token = accessToken;
        console.log('Generating MERCADOPAGO SANDBOX link', mpOptions);
    } else {
        //productive
        mpOptions.client_id = clientId;
        mpOptions.client_secret = clientSecret;
        console.log('Generating MERCADOPAGO PRODUCTIVE link', mpOptions);
    }

    mp.configure(mpOptions);

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
    /*
        curl -X POST \
             -H 'accept: application/json' \
             -H 'content-type: application/x-www-form-urlencoded' \
             'https://api.mercadopago.com/oauth/token' \
             -d 'client_id=CLIENT_ID' \
             -d 'client_secret=CLIENT_SECRET' \
             -d 'grant_type=authorization_code' \
             -d 'code=AUTHORIZATION_CODE' \
             -d 'redirect_uri=REDIRECT_URI'
    */

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
