#! /usr/bin/env node

console.log('This script populates some test quizzes');

const mongoose = require('mongoose');
const async = require('async');

const Quiz = require('./src/models/quiz');
const config = require('./src/config/config');

const mongoDB = `mongodb://${config.mongo.user}:${config.mongo.pass}@${config.mongo.url}`;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

function quizCreate(question, answers, correctAnswerID, cb) {
    quizDetails = {
        question: question,
        answers: answers.map((answer, idx) => {
            let correct = (idx === (correctAnswerID - 1));
            return {
                answer: answer,
                correct: correct
            };
        })
    };

    let quiz = new Quiz(quizDetails);

    quiz.save(function(err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Quiz: ' + quiz);
        cb(null, quiz)
    });
}


function createQuiz(cb) {
    async.parallel([
            function(callback) {
                quizCreate(`What's the first letter of the alphabet?`, ['answerA', 'answerB', 'answerC'], 1, callback);
            },
            function(callback) {
                quizCreate(`What's the second letter of the alphabet?`, ['answerA', 'answerB', 'answerC'], 2, callback);
            },
            function(callback) {
                quizCreate(`What's the third letter of the alphabet?`, ['answerA', 'answerB', 'answerC'], 3, callback);
            },
        ],
        cb);
}


async.series([
        createQuiz
    ],
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        mongoose.connection.close();
    });