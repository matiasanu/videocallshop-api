const userModel = require('../models/user');

authenticateUser = async (req, res, next) => {
    console.log(
        '-------- authentication CONTROLLER postAuthentication --------'
    );

    const { email, password } = req.body;
    userModel.getUserCredentials(email, password);
    res.send({ email, password });

    /*
    try {

        await getUserCredentials(email, password);

        res.sendStatus(201);
        next();
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500) && next(error);
    }
    */
};

module.exports = {
    authenticateUser,
};
