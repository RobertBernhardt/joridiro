"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ParticipantSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    contest: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Contest',
    },
    score: [{
            category: {
                type: mongoose_1.Schema.Types.ObjectId,
            },
            points: {
                type: Number,
                default: 0,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            rank: {
                type: Number,
                default: 0,
            },
        }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Participant', ParticipantSchema);
