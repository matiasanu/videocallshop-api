const initRedisCli = require('../helpers/redis');
const pool = require('../helpers/postgres');

// models
const callRequestModel = require('./callRequest');
const storeModel = require('./store');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
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

//ToDo: Remove
const addRequest = async (storeId, email, name, lastName) => {
    try {
        const now = new Date().toISOString();

        const result = await pool.query(
            `INSERT INTO waiting_room_requests(store_id, name, last_name, email, created_on) VALUES ('${storeId}', '${name}', '${lastName}', '${email}', '${now}') RETURNING waiting_room_request_id;`
        );

        return result.rows[0].waitingRoomRequestId;
    } catch (err) {
        console.log('ERROR query addRequest');
        throw new Error(err.message);
    }
};

const getRequest = async waitingRoomRequestId => {
    try {
        const result = await pool.query(
            `SELECT * FROM waiting_room_requests r WHERE r.waiting_room_request_id='${waitingRoomRequestId}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getRequest');
        throw new Error(err.message);
    }
};

const searchRequests = async (email, state) => {
    try {
        const result = await pool.query(
            `SELECT * FROM waiting_room_requests r WHERE r.email='${email}' AND r.state='${state}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getRequest');
        throw new Error(err.message);
    }
};

const pushClient = async (requestId, storeId) => {
    try {
        const waitingRoomId = `waitingRoom${storeId}`;

        let listLength = await redisCli
            .multi()
            .rpush(waitingRoomId, requestId)
            .execAsync();
        listLength = listLength[0];

        // return members affected
        return listLength;
    } catch (err) {
        throw err;
    }
};

const removeClient = async (waitingRoomRequestId, storeId) => {
    try {
        const myWaitingRoomId = `waitingRoom${storeId}`;

        const membersAffected = await redisCli
            .multi()
            .lrem(myWaitingRoomId, 0, waitingRoomRequestId)
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

const setState = async (waitingRoomRequestId, state) => {
    try {
        const now = new Date().toISOString();

        const resultState = await pool.query(
            `UPDATE waiting_room_requests SET state='${state}' WHERE waiting_room_request_id='${waitingRoomRequestId}';`
        );

        const resultLog = await pool.query(
            `INSERT INTO waiting_room_log(waiting_room_request_id, state, created_on) VALUES('${waitingRoomRequestId}', '${state}', '${now}');`
        );

        return resultState.rows;
    } catch (err) {
        console.log('ERROR query setState');
        throw new Error(err.message);
    }
};

module.exports = {
    getQueue,
    findCallRequestInQueue,
    findCallRequestInQueueByEmail,
    getWaitingRoomByStoreId,
    pushCallRequestInQueue,
    removeCallRequestInQueue,
    getRequest,
    addRequest,
    pushClient,
    removeClient,
    getWaitingRoom,
    setState,
    searchRequests,
};
