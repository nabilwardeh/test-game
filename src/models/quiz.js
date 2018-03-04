'use strict';

let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let quizSchema = new Schema({
    question: { type: String, required: true },
    answers: [{
        answer: { type: String, required: true },
        correct: { type: Boolean, required: true, default: false }
    }],
});

module.exports = mongoose.model('Quiz', quizSchema);