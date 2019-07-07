const redisHelper = require('../helpers/redis');

// models
const callRequestModel = require('./callRequest');
const storeModel = require('./store');

let redisCli = null;
(async () => {
    redisCli = await redisHelper.createClient();
})();

const getWaitingRooms = async () => {
    // assume we have one-to-one stores and waiting rooms relationship
    const stores = await storeModel.getStores();
    const waitingRooms = stores.map(store => {
        return {
            waitingRoomId: `waitingRoom${store.storeId}`,
            storeId: store.storeId,
        };
    });

    return waitingRooms;
};

const getWaitingRoomByStoreId = async storeId => {
    const waitingRooms = await getWaitingRooms();
    let waitingRoomFounded = null;
    for (const waitingRoom of waitingRooms) {
        if (parseInt(waitingRoom.storeId) === parseInt(storeId)) {
            waitingRoomFounded = waitingRoom;
        }
    }

    return waitingRoomFounded;
};

const getQueue = async waitingRoomId => {
    const waitingRoom = await redisCli
        .multi()
        .lrange(waitingRoomId, 0, -1)
        .execAsync();

    return waitingRoom[0];
};

const pushCallRequestInQueue = async (waitingRoomId, callRequestId) => {
    try {
        let result = await redisCli
            .multi()
            .rpush(waitingRoomId, callRequestId)
            .execAsync();
        listLength = result[0];

        await broadcastQueue(waitingRoomId);

        return listLength;
    } catch (err) {
        throw err;
    }
};

const removeCallRequestInQueue = async (waitingRoomId, callRequestId) => {
    try {
        const membersAffected = await redisCli
            .multi()
            .lrem(waitingRoomId, 0, callRequestId)
            .execAsync();

        await broadcastQueue(waitingRoomId);

        return membersAffected[0];
    } catch (err) {
        throw err;
    }
};

const findCallRequestInQueueByEmail = async email => {
    const waitingRooms = await getWaitingRooms();
    let callRequestFounded = null;

    for await (const waitingRoom of waitingRooms) {
        const queue = await getQueue(waitingRoom.waitingRoomId);
        for await (const callRequestId of queue) {
            const callRequest = await callRequestModel.getCallRequest(
                callRequestId
            );

            if (callRequest && callRequest.email === email) {
                callRequestFounded = callRequest;
            }
        }
    }

    return callRequestFounded;
};

const findCallRequestInQueue = async callRequestIdToFind => {
    const waitingRooms = await getWaitingRooms();
    let callRequestFounded = null;

    for await (const waitingRoom of waitingRooms) {
        const queue = await getQueue(waitingRoom.waitingRoomId);
        for await (const callRequestId of queue) {
            if (parseInt(callRequestId) === parseInt(callRequestIdToFind)) {
                callRequestFounded = await callRequestModel.getCallRequest(
                    callRequestId
                );
            }
        }
    }

    return callRequestFounded;
};

const broadcastQueue = async waitingRoomId => {
    const queue = await getQueue(waitingRoomId);
    const message = {
        type: 'QUEUE_CHANGED',
        value: queue,
    };
    redisCli.publish(waitingRoomId, JSON.stringify(message));
};

const subscribeQueues = async redisCli => {
    const waitingRooms = await getWaitingRooms();
    for await (const waitingRoom of waitingRooms) {
        redisCli.subscribe(waitingRoom.waitingRoomId);
    }
};

module.exports = {
    getWaitingRooms,
    getWaitingRoomByStoreId,
    getQueue,
    pushCallRequestInQueue,
    removeCallRequestInQueue,
    findCallRequestInQueueByEmail,
    findCallRequestInQueue,
    broadcastQueue,
    subscribeQueues,
};
