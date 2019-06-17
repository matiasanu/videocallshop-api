const initRedisCli = require('../helpers/redis');
const pool = require('../helpers/postgres');

let redisCli = null;

(async () => {
    redisCli = await initRedisCli();
})();

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
    getRequest,
    addRequest,
    pushClient,
    removeClient,
    getWaitingRoom,
    setState,
    searchRequests,
};
