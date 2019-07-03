const jwt = require('jsonwebtoken');

const generateJwt = payload => {
    const jwtOptions = {
        expiresIn: '2h',
    };

    return jwt.sign(payload, process.env.JWT_SECRET, jwtOptions);
};

module.exports = {
    generateJwt,
};
