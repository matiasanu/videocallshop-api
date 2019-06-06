const userModel = require('../models/user');
const personModel = require('../models/person');

registerClient = async (req, res, next) => {
    const { email, name, last_name, dni } = req.body;

    try {
        const { roles } = await userModel.getUserRolesByEmail(email);

        if (roles.length) {
            // user already exist
            let userIsSeller = false;
            roles.forEach(role, () => {
                if (role.role_id == 2) {
                    userIsSeller = true;
                }
            });

            if (!userIsSeller) {
                // user is not a seller, so update his data
                await personModel.updatePersonByUserId(
                    roles[0].user_id,
                    name,
                    last_name,
                    dni
                );
            }
        } else {
            // new user, create one
        }
    } catch (err) {
        res.status(500);
        res.send(err.message);
    }
};

module.exports = {
    registerClient,
};
