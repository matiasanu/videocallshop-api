const authorizationMidd = require('./authorization');

const checkAuthorization = async (socket, next) => {
    return authorizationMidd.checkAuthorization(socket.handshake, null, next);
};

module.exports = {
    checkAuthorization,
};
