const storeModel = require('../models/store');

const getStore = async (req, res, next) => {
    const { storeId } = req.params;
    const { rows } = await storeModel.getStore(storeId);

    if (!rows.length) {
        const status = 401;
        res.status(status);
        res.send({ status: status, message: 'Store not found.' });

        return;
    } else {
        // store founded
        const status = 200;
        let store = rows[0];
        res.status(status);
        res.send({ store, status });
    }

    console.log(store);
};

module.exports = {
    getStore,
};
