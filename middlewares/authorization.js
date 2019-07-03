const checkAuthorization = (req, res, next) => {
    let authorization = {
        callRequestToken: {
            valid: false,
            thisStore: false,
        },
        storeUser: {
            authenticated: false,
            thisStore: false,
        },
    };
};

module.exports = {
    checkAuthorization,
};
