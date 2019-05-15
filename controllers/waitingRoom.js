const client = require('../helpers/redis');

addUser = async (req, res, next) => {
    const { name, id } = req.body;

    return new Promise((resolve, reject) => {
        client()
            .then(res => {
                res
                    .multi()
                    .lpush('waiting_room', id)
                    .execAsync()
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
                const status = 500;
                res.status(status);
                res.send({ status, message: err });
                console.log('---------------------', err);
            });
    })
        .then(msg => {
            const status = 200;
            res.status(status);
            res.send({ status, message: msg });
        })
        .catch(err => {
            const status = 500;
            res.status(status);
            res.send({ status, message: err });
        });
};

module.exports = {
    addUser,
};
