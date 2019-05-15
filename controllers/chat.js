'use strict';

import express from 'express';
import { client } from '../helpers/redis';
import * as helper from '../lib/functions';

const router = express.Router();

let fetchMessages = () => {
    return helper.fetchMessages().then(
        res => {
            return res;
        },
        err => {
            console.log(err);
        }
    );
};

let fetchUsers = () => {
    return helper.fetchActiveUsers().then(
        res => {
            return res;
        },
        err => {
            console.log(err);
        }
    );
};
