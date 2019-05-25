const client = require('../helpers/redis');

const pushClient = async (clientId, storeId) => {
    try {
        const redisCli = await client();
        const myWaitingRoomId = `waitingRoom${storeId}`;
        const score = 0;

        const membersAffected = await redisCli
            .multi()
            .zadd(myWaitingRoomId, score, clientId)
            .execAsync();

        return membersAffected[0];
    } catch (err) {
        throw err;
    }
};

const removeClient = async (clientId, storeId) => {
    try {
        const redisCli = await client();
        const myWaitingRoomId = `waitingRoom${storeId}`;

        const membersAffected = await redisCli
            .multi()
            .zrem(myWaitingRoomId, clientId)
            .execAsync();

        return membersAffected[0];
    } catch (err) {
        throw err;
    }
};

const getWaitingRoom = async storeId => {
    try {
        const redisCli = await client();
        const myWaitingRoomId = `waitingRoom${storeId}`;

        const waitingRoom = await redisCli
            .multi()
            .zrange(myWaitingRoomId, 0, -1)
            .execAsync();

        return waitingRoom[0];
    } catch (err) {
        throw err;
    }
};

module.exports = {
    pushClient,
    removeClient,
    getWaitingRoom,
};
