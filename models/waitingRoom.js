const initRedisCli = require('../helpers/redis');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

const pushClient = async (clientId, storeId) => {
    try {
        let waitingRoom = await getWaitingRoom(storeId);

        // search if user already exists in waiting room queue
        let clientFound = false;
        waitingRoom.forEach(clientIdOnWaitingRoom => {
            if (clientIdOnWaitingRoom === clientId) {
                clientFound = true;
            }
        });

        if (clientFound) {
            // return members affected
            return 0;
        }

        const myWaitingRoomId = `waitingRoom${storeId}`;

        let listLength = await redisCli
            .multi()
            .rpush(myWaitingRoomId, clientId)
            .execAsync();
        listLength = listLength[0];

        // return members affected
        return 1;
    } catch (err) {
        throw err;
    }
};

const removeClient = async (clientId, storeId) => {
    try {
        const myWaitingRoomId = `waitingRoom${storeId}`;

        const membersAffected = await redisCli
            .multi()
            .lrem(myWaitingRoomId, 0, clientId)
            .execAsync();

        return membersAffected[0];
    } catch (err) {
        throw err;
    }
};

const getWaitingRoom = async storeId => {
    try {
        const myWaitingRoomId = `waitingRoom${storeId}`;

        const waitingRoom = await redisCli
            .multi()
            .lrange(myWaitingRoomId, 0, -1)
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
