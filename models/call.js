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

const findCallsByStoreId = async (storeId, filters) => {
    let query = `SELECT c.* FROM calls c INNER JOIN call_requests cr ON cr.call_request_id = c.call_request_id WHERE cr.store_id='${storeId}'`;

    if (filters.state) {
        query += `AND cr.state='${filters.state}'`;
    }

    if (filters.callRequestId) {
        query += `AND c.call_request_id='${filters.callRequestId}'`;
    }

    if (filters.storeUserId) {
        query += `AND c.store_user_id='${filters.storeUserId}'`;
    }

    console.log(query);

    try {
        const result = await pool.query(query);

        return result.rows;
    } catch (err) {
        console.log(err);
        console.log('ERROR query findCallsByStoreId');
        throw new Error(err.message);
    }
};

const getCallsByStoreUserAndState = async (storeUserId, state) => {
    try {
        const result = await pool.query(
            `SELECT * FROM calls c INNER JOIN call_requests cr ON cr.call_request_id = c.call_request_id WHERE c.store_user_id='${storeUserId}' AND cr.state='${state}' LIMIT 1;`
        );

        return result.rows;
    } catch (err) {
        console.log(err);
        console.log('ERROR query getCallsByStoreUserAndState');
        throw new Error(err.message);
    }
};

const registerCall = async (
    callRequestId,
    storeUserId,
    tokboxSessionId,
    tokenStoreUser,
    tokenCallRequest
) => {
    try {
        const now = new Date().toISOString();

        const result = await pool.query(
            `INSERT INTO calls(call_request_id, tokbox_session_id, store_user_id, tokbox_token_call_request, tokbox_token_store_user, created_on) VALUES ('${callRequestId}', '${tokboxSessionId}', '${storeUserId}', '${tokenCallRequest}', '${tokenStoreUser}', '${now}') RETURNING call_id;`
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
    getCallsByStoreUserAndState,
    findCallsByStoreId,
};
