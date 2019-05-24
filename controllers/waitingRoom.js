const client = require('../helpers/redis');

addUser = async (req, res, next) => {
    const { name, clientId, storeId } = req.body;
    try {
        const redisCli = await client();
        const myChannel = `waitingRoom${storeId}`;

        const waitingRoom = await redisCli
            .multi()
            .lrange(myChannel, 0, -1)
            .execAsync();

        // search if user already exists in waiting room queue
        waitingRoom[0].forEach(clientIdOnWaitingRoom => {
            if (clientIdOnWaitingRoom === clientId) {
                throw new Error('Client already exists');
            }
        });

        let queueLength = await redisCli
            .multi()
            .rpush(myChannel, clientId)
            .execAsync();

        queueLength = queueLength[0];

        redisCli.publish(myChannel, clientId);

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
