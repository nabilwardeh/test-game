"use strict";

const mongoose = require('mongoose');
const config = require('../config/config');

mongoose.Promise = global.Promise;

//helpers
const setDBStatus = (status, message) => {
    return {
        status: status,
        message: message
    }
};

module.exports = (() => {
    const mongoDB = `mongodb://${config.mongo.user}:${config.mongo.pass}@${config.mongo.url}`;
    return mongoose.connect(mongoDB, (err) => {
        if (err) {
            console.log(`ERROR: ${err.message || err}`);
        }
    });
})();