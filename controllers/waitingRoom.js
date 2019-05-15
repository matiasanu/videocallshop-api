const client = require('../helpers/redis');

addUser = async (req, res, next) => {
    const { name, id } = req.body;

    return new Promise((resolve, reject) => {
        client()
            .then(res => {
                res
                    .multi()
                    .lrange('waiting_room', 0, -1)
                    .lpush('waiting_room', id)
                    .execAsync()
                    .then(waitingRoom => {
                        waitingRoom[0].forEach(cli => {
                            if (cli === id) {
                                reject('Client already exists');
                            }
                        });
                    })
                    .then(
                        res => {
                            resolve('User added');
                        },
                        err => {
                            reject(err);
                        }
                    ),
                    err => {
                        reject('Redis connection failed: ' + err);
                    };
            })
            .catch(err => {
                // connection fail

                console.log('----- FIRST CATCH -------', err);
                const status = 500;
                res.status(status);
                res.send({ status, message: err });
            });
    })
        .then(msg => {
            const status = 200;
            res.status(status);
            res.send({ status, message: msg });
        })
        .catch(err => {
            console.log('----- SECOND CATCH -------');
            const status = 500;
            res.status(status);
            res.send({ status, message: err });
        });
};

module.exports = {
    addUser,
};
