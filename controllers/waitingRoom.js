const client = require('../helpers/redis');

addUser = async (req, res, next) => {
    const { name, id } = req.body;
    try {
        const redisCli = await client();

        const waitingRoom = await redisCli
            .multi()
            .lrange('waiting_room', 0, -1)
            .execAsync();

        // search if user already exists in waiting room queue
        waitingRoom[0].forEach(client => {
            if (client === id) {
                throw new Error('Client already exists');
            }
        });

        let queueLength = await redisCli
            .multi()
            .rpush('waiting_room', id)
            .execAsync();

        queueLength = queueLength[0];

        redisCli.publish('waitingRoom', id);

        const status = 200;
        res.status(status);
        res.send({ status, message: 'User added', queueLength });
    } catch (err) {
        const status = 500;
        console.log(err);
        res.status(status);
        res.send({ status, message: err.message ? err.message : err });
    }
};

module.exports = {
    addUser,
};
