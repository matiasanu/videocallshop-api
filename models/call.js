const pool = require('../helpers/postgres');

const getCall = async callId => {
    const result = await pool.query(
        `SELECT * FROM calls c WHERE c.call_id='${callId}' LIMIT 1;`
    );

    if (result.rows.length) {
        return result.rows[0];
    } else {
        throw new Error('Call was not found.');
    }
};

const registerCall = async (callRequestId, tokboxSessionId, storeUserId) => {
    try {
        const now = new Date().toISOString();

        const result = await pool.query(
            `INSERT INTO calls(call_request_id, tokbox_session_id, store_user_id, created_on) VALUES ('${callRequestId}', '${tokboxSessionId}', '${storeUserId}', '${now}') RETURNING call_id;`
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
