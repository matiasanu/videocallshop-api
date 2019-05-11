const jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (!token) {
        const status = 400;
        return res.status(status).send({
            status: status,
            message: 'Auth token is not supplied',
        });
    }

    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    try {
        req.decoded = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (ex) {
        const status = 401;
        res.status(status).send({
            status: status,
            message: ex.message ? ex.message : 'Token is not valid',
        });
    }
};

module.exports = checkToken;
