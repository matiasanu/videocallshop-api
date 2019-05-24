const client = require('../helpers/redis');

const pushClient = async (clientId, storeId) => {
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

        redisCli.publish(myWaitingRoomId, waitingRoom.toString());

        return waitingRoom;
    } catch (err) {
        throw err;
    }
};

module.exports = {
    pushClient,
};
