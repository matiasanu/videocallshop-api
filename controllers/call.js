var OpenTok = require('opentok');

const waitingRoomCtrl = require('../controllers/waitingRoom');
const callModel = require('../models/call');

const callClient = async (req, res, next) => {
    const { storeId } = req.params;
    const { waitingRoomRequestId } = req.body;

    // Generate tokbox session id
    var opentok = new OpenTok(
        process.env.TOKBOX_API_KEY,
        process.env.TOKBOX_API_SECRET
    );

    opentok.createSession({ mediaMode: 'routed' }, async (error, session) => {
        if (error) {
            console.log('Error creating session:', error);
        } else {
            try {
                const tokboxSessionId = session.sessionId;
                console.log('Session ID: ' + tokboxSessionId);

                // ToDo: Uncouple controllers (business logic layer)
                await waitingRoomCtrl.setRequestCalled(
                    storeId,
                    waitingRoomRequestId
                );

                const storeUserId = req.session.user.storeUserId;
                const callId = await callModel.registerCall(
                    waitingRoomRequestId,
                    tokboxSessionId,
                    storeUserId
                );

                //ToDo: Implement push notifications

                const status = 200;
                res.status(status);
                res.send({ status, data: { tokboxSessionId, callId } });
                next();
            } catch (err) {
                err.status = 500;
                return next(err);
            }
        }
    });
};

module.exports = {
    callClient,
};
