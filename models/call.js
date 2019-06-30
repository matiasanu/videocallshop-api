const pool = require('../helpers/postgres');

const getCall = async callId => {
    try {
        const result = await pool.query(
            `SELECT * FROM calls c WHERE c.call_id='${callId}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log('ERROR query getStore');
        throw new Error(err.message);
    }
};

const registerCall = async (
    waitingRoomRequestId,
    tokboxSessionId,
    storeUserId
) => {
    try {
        const now = new Date().toISOString();

        const result = await pool.query(
            `INSERT INTO calls(waiting_room_request_id, tokbox_session_id, store_user_id, created_on) VALUES ('${waitingRoomRequestId}', '${tokboxSessionId}', '${storeUserId}', '${now}') RETURNING waiting_room_request_id;`
        );

        return result.rows[0].callId;
    } catch (err) {
        console.log(err);
        console.log('ERROR query registerCall');
        throw new Error(err.message);
    }
};

module.exports = {
    getCall,
    registerCall,
};
