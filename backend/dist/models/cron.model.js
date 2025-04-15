"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContestCronSchema = new mongoose_1.Schema({
    _id: {
        type: Date,
        required: true,
    },
    contests: [
        {
            date: {
                type: Date,
                required: true,
            },
            contest_id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
                enum: ["MILESTONE", "CONTEST_END"]
            },
            milestone_id: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: false,
            }
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('ContestCron', ContestCronSchema);
