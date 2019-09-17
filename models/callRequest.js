const pool = require('../helpers/postgres');

const getCallRequest = async callRequestId => {
    try {
        const result = await pool.query(
            `SELECT * FROM call_requests cr WHERE cr.call_request_id='${callRequestId}' LIMIT 1;`
        );

        return result.rows.length ? result.rows[0] : null;
    } catch (err) {
        console.log('ERROR query getCallRequest');
        throw new Error(err.message);
    }
};

const createCallRequest = async (
    storeId,
    email,
    name,
    lastName,
    onesignalPlayerId,
    state
) => {
    try {
        const now = new Date().toISOString();
        onesignalPlayerId = onesignalPlayerId || null;

        const result = await pool.query(
            `INSERT INTO call_requests(store_id, name, last_name, email, state, onesignal_player_id, created_on) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING call_request_id;`,
            [storeId, name, lastName, email, state, onesignalPlayerId, now]
        );

        return result.rows[0].callRequestId;
    } catch (err) {
        console.log('ERROR query createCallRequest');
        throw new Error(err.message);
    }
};

const setState = async (callRequestId, state) => {
    try {
        const now = new Date().toISOString();

        const resultState = await pool.query(
            `UPDATE call_requests SET state='${state}' WHERE call_request_id='${callRequestId}';`
        );

        await pool.query(
            `INSERT INTO call_requests_log(call_request_id, state, created_on) VALUES('${callRequestId}', '${state}', '${now}');`
        );

        return resultState.rowCount;
    } catch (err) {
        console.log('ERROR query setState');
        throw new Error(err.message);
    }
};

module.exports = {
    getCallRequest,
    createCallRequest,
    setState,
};
