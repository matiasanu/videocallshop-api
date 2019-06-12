const jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
    let header = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (!header) {
        const status = 400;
        return res.status(status).send({
            status: status,
            message: 'Auth token is not supplied',
        });
    }

    const token = getTokenFromHeader(header);

    try {
        req.jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        const status = 401;
        res.status(status).send({
            status: status,
            message: err.message ? err.message : 'Token is not valid',
        });
    }
};

let getTokenFromHeader = header => {
    if (header.startsWith('Bearer ')) {
        // Remove Bearer from string
        return header.slice(7, header.length);
    }

    return header;
};

module.exports = { checkToken, getTokenFromHeader };
