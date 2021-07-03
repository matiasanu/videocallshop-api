'use strict';

const redis = require('redis');
const promise = require('bluebird');

const REDIS_URL = process.env.REDIS_URL;

console.log(':::: REDIS_URL', REDIS_URL);

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

const createClient = () => {
    return new Promise((resolve, reject) => {
        let connector = redis.createClient(REDIS_URL);

        connector.on('error', () => {
            reject(new Error('Redis Connection failed'));
        });

        connector.on('connect', () => {
            console.log('**************** CONNECTED!!!!!')
            resolve(connector);
        });
    }).catch(err => {
        return err;
    });
};

module.exports = { createClient };
