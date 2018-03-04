"use strict";

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/config');


const game = require('./controllers/game');

const mongoDB = `mongodb://${config.mongo.user}:${config.mongo.pass}@${config.mongo.url}`;
mongoose.connect(mongoDB, (err) => {
    if (err) {
        console.log(`ERROR: ${err.message || err}`);
    }
});

mongoose.Promise = global.Promise;
let db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/game', game);

app.use('/', (req, res, next) => {
    if (req.url === '/') {
        res.json({ status: db.states[db.readyState] });
    } else {
        next();
    }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err.message || 'Unknown' });
});

module.exports = app;