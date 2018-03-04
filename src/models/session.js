'use strict';

let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let sessionSchema = new Schema({
    sessionID: { type: Number, required: true },
    sessionStatus: { type: String, required: true, enum: ['started', 'saved'] },
    availableQuestions: [{ type: Schema.ObjectId, ref: 'Quiz', required: true }],
    answeredQuestions: [{
        question: { type: Schema.ObjectId, ref: 'Quiz', required: true },
        correct: { type: Boolean, required: true, default: false },
    }],
    currentQuestion: { type: Number, required: true },
    answerExpected: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model('Session', sessionSchema);