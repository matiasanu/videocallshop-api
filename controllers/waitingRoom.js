const client = require('../helpers/redis');

addUser = async (req, res, next) => {
    const { name, clientId, storeId } = req.body;
    try {
        const redisCli = await client();
        const myWaitingRoomId = `waitingRoom${storeId}`;

        let waitingRoom = await redisCli
            .multi()
            .lrange(myWaitingRoomId, 0, -1)
            .execAsync();

        waitingRoom = waitingRoom[0];

        // search if user already exists in waiting room queue
        waitingRoom.forEach(clientIdOnWaitingRoom => {
            if (clientIdOnWaitingRoom === clientId) {
                throw new Error('Client already exists');
            }
        });

        let queueLength = await redisCli
            .multi()
            .rpush(myWaitingRoomId, clientId)
            .execAsync();

        queueLength = queueLength[0];

        waitingRoom.push(clientId);

        console.log('--------', waitingRoom);

        redisCli.publish(myWaitingRoomId, waitingRoom.toString());

        const status = 200;
        res.status(status);
        res.send({ status, message: 'User added', queueLength });
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
