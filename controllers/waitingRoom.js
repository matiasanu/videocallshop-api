const waitingRoomModel = require('../models/waitingRoom');

const getWaitingRoom = async (req, res, next) => {
    // authorization
    const hasAccess =
        req.authorization.storeUser.thisStore ||
        (req.authorization.callRequestToken.thisStore &&
            req.authorization.callRequestToken.inQueue);
    if (!hasAccess) {
        const err = new Error('Unauthorized.');
        err.status = 404;
        return next(err);
    }

    let { storeId } = req.params;
    storeId = parseInt(storeId);

    try {
        const waitingRoom = await waitingRoomModel.getWaitingRoomByStoreId(
            storeId
        );

        if (!waitingRoom) {
            throw new Error('Store does not have waiting room.');
        }

        waitingRoom.queue = await waitingRoomModel.getQueue(
            waitingRoom.waitingRoomId
        );

        const status = 200;
        res.status(status);
        res.send({ status, data: waitingRoom });
    } catch (err) {
        err.status = 500;
        return next(err);
    }
};

const getWaitingRoomBySocket = async socket => {
    try {
        // console.log('Socket authorization', socket.handshake.authorization);
        // authorization
        const hasAccess =
            socket.handshake.authorization.storeUser.thisStore ||
            (socket.handshake.authorization.callRequestToken.thisStore &&
                socket.handshake.authorization.callRequestToken.inQueue);

        if (!hasAccess) {
            socket.disconnect();
        }

        const { storeId } = socket.handshake.query;

        // join to the socket.io room in order to listen when waiting room was changed
        let waitingRoom = await waitingRoomModel.getWaitingRoomByStoreId(
            storeId
        );

        socket.join(waitingRoom.waitingRoomId, () => {
            let rooms = Object.keys(socket.rooms);
        });

        waitingRoom.queue = await waitingRoomModel.getQueue(
            waitingRoom.waitingRoomId
        );

        socket.emit('WAITING_ROOM_SENDED', waitingRoom);

        socket.on('disconnect', function() {});
    } catch (err) {
        socket.disconnect();
        console.log(
            '------ ERROR EN EL HANDLER CONNECT DEL SOCKET ------',
            err.message
        );
    }
};

module.exports = {
    getWaitingRoom,
    getWaitingRoomBySocket,
};
