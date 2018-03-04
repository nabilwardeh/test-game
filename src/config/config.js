"use strict";

const config = {
    mongo: {
        url: process.env.TESTGAME_DB_HOST || '',
        user: process.env.TESTGAME_DB_USER || '',
        pass: process.env.TESTGAME_DB_PASS || '',
    }
};

module.exports = config;