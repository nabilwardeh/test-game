'use strict';

const express = require('express');
const Quiz = require('../models/quiz');
const Session = require('../models/session');
const router = express.Router();
const queryValues = new Set(['start', 'answerA', 'answerB', 'answerC', 'next']);

const sessionID = 1;

router.get('/', function(req, res, next) {
    if (!req.query.intent || !queryValues.has(req.query.intent)) {
        console.log('Bad request');
        res.send(ssmlEncoded('Bad request!'));
        return;
    }
    let intent = req.query.intent;
    if (intent === 'start') {
        startSession(sessionID)
            .then(session => {
                session = session[0];
                if (session.availableQuestions.length < 1) {
                    res.send(ssmlEncoded('No questions found for this site!'));
                    return;
                }
                res.send(ssmlEncoded(getCurrentQuestion(session)));
            })
            .catch(error => {
                console.log(error);
                res.send(ssmlEncoded(error.message || error));
            });
    }
    if (/^answer{1}[A-C]{1}$/g.test(intent)) {
        getSession(sessionID)
            .then(session => {
                session = session[0];
                if (!session) {
                    res.send(ssmlEncoded(`You ddon't have an open session yet!`));
                    return;
                }
                if (!session.answerExpected) {
                    res.send(ssmlEncoded(`Answer is not expected`));
                    return;
                }
                let answerIsCorrect = false;
                session.availableQuestions[session.currentQuestion].answers.map(answer => {
                    if (answer.answer === intent && answer.correct)
                        answerIsCorrect = true;
                });
                session.answeredQuestions.push({
                    question: session.availableQuestions[session.currentQuestion]._id,
                    correct: answerIsCorrect,
                });
                session.availableQuestions.splice(session.currentQuestion, 1);
                session.availableQuestions.map(question => question._id);
                let id = session._id;
                delete session._id;
                session.currentQuestion = randomise(session.availableQuestions.length);
                session.answerExpected = false;
                Session.findByIdAndUpdate(id, session, (err, session) => {
                    if (err) {
                        throw (err.message || err)
                    } else {
                        res.send(ssmlEncoded(`That's ${answerIsCorrect ? 'correct' : 'wrong'}!`));
                    }
                });
            })
            .catch(error => res.send(ssmlEncoded(error.message || error)))
    }
    if (intent === 'next') {
        getSession(sessionID)
            .then(session => {
                console.log(" NEXT ");
                session = session[0];
                if (!session) {
                    res.send(ssmlEncoded(`You ddon't have an open session yet!`));
                    return;
                }
                if (session.answerExpected) {
                    res.send(ssmlEncoded(`Next is not expected`));
                    return;
                }
                if (session.availableQuestions.length < 1 && session.answeredQuestions.length > 0) {
                    Session.findByIdAndRemove(session._id)
                        .then(session => {
                            res.send(ssmlEncoded(`You have answered all questions! Session deleted`));
                        })
                        .catch(error => {
                            res.send(ssmlEncoded(error.massage || error));
                        })
                    return;
                }
                Session.findByIdAndUpdate(session._id, { answerExpected: true }).
                populate('availableQuestions').
                populate('answeredQuestions').
                exec((err, session) => {
                    if (err) {
                        throw (err.message || err)
                    } else {
                        res.send(ssmlEncoded(getCurrentQuestion(session)));
                    }
                })
            })
            .catch(error => res.send(ssmlEncoded(error.message || error)))
    }
});

function randomise(range) {
    return Math.floor(Math.random() * (range));
}

function startSession(ID) {
    return new Promise((resolve, reject) => {
        Session.find({ sessionID: ID }, (error, result) => {
            if (error) {
                let err = new Error('Internal server error');
                err.status = 500;
                reject(err);
            } else if (result.length > 0) {
                let err = new Error('Session exist');
                err.status = 400;
                reject(err);
            } else {
                Quiz.find((error, questions) => {
                    if (error) {
                        let err = new Error('Internal server error');
                        err.status = 500;
                        reject(err);
                    } else {
                        let session = new Session({
                            sessionID: sessionID,
                            sessionStatus: 'started',
                            availableQuestions: questions.map(question => question._id),
                            answeredQuestions: [],
                            currentQuestion: randomise(questions.length),
                            answerExpected: true,
                        });
                        session.save((err) => {
                            if (error) {
                                let err = new Error('Internal server error');
                                err.status = 500;
                                reject(err);
                            } else {
                                getSession(ID)
                                    .then(sessionPopulated => resolve(sessionPopulated))
                                    .catch(err => reject(err))
                            }
                        })
                    }
                });
            }
        })
    })
}

function getSession(ID) {
    return new Promise((resolve, reject) => {
        Session.find({ sessionID: ID }).
        populate('availableQuestions').
        populate('answeredQuestions').
        exec((error, sessionPopulated) => {
            if (error) {
                let err = new Error('Internal server error');
                err.status = 500;
                reject(err);
            } else {
                resolve(sessionPopulated);
            }
        })
    })
}

function ssmlEncoded(text) {
    return `<speak>${text}</speak>`;
}

function getCurrentQuestion(session) {
    const availableQuestions = session.availableQuestions;
    const currentQuestion = session.currentQuestion;
    return availableQuestions[currentQuestion].question;
}

module.exports = router;