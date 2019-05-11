//const { userService } = require('../services/userService');
//const { getUserCredentials } = userService;

exports.postAuthentication = async (req, res, next) => {
    console.log(
        '-------- authentication CONTROLLER postAuthentication --------'
    );
    /*
    const { email, password } = req.body;
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
