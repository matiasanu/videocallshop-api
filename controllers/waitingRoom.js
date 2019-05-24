const waitingRoomModel = require('../models/waitingRoom');

addUser = async (req, res, next) => {
    const { name, clientId, storeId } = req.body;
    try {
        const waitingRoom = await waitingRoomModel.pushClient(
            clientId,
            storeId
        );

        const status = 200;
        res.status(status);
        res.send({ status, message: 'User added', waitingRoom });
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

module.exports = {
    addUser,
};
