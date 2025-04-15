"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContestEditSchema = new mongoose_1.Schema({
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    open: {
        type: Boolean,
        default: true,
    },
    banner: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    type: {
        type: String,
        required: true,
        enum: ['SMALL', 'MEDIUM', 'LARGE'],
    },
    scoreContest: {
        required: true,
        type: Boolean,
    },
    company: {
        title: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        logo: {
            type: String,
            required: true,
        },
    },
    rules: {
        type: [String],
        required: true,
    },
    about: {
        text: [{
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
            }],
        media: {
            images: [{
                    type: String,
                }],
            videos: [{
                    type: String,
                }],
        }
    },
    announcements: [{
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            },
        }],
    requirements: {
        type: [String],
        required: true,
    },
    howToJoin: {
        type: [String],
        required: true,
    },
    prizes: {
        currency: {
            type: String,
            required: true,
        },
        rankPrizes: [{
                rank: {
                    type: Number,
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                winner: {
                    type: mongoose_1.Schema.Types.ObjectId || null,
                    ref: 'User',
                },
            }],
        milestones: [{
                date: {
                    type: Date,
                },
                score: {
                    type: Number,
                },
                amount: {
                    type: String,
                    required: true,
                },
                winner: {
                    type: mongoose_1.Schema.Types.ObjectId || null,
                    ref: 'User',
                },
            }],
        lottery: {
            amount: {
                type: Number,
                required: true,
            },
            winner: {
                type: mongoose_1.Schema.Types.ObjectId || null,
                ref: 'User',
            },
        },
    },
    boosts: {
        description: {
            type: String,
        },
        list: {
            type: [String],
        }
    },
    faq: [{
            question: {
                type: String || null,
                required: true,
            },
            answer: {
                text: {
                    type: String || null,
                },
                answeredBy: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        }],
    participantQuestions: [{
            questions: {
                type: String,
                required: true,
            },
            options: {
                type: [String],
                required: true
            }
        }],
    participants: [{
            _id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Participant',
            },
            score: {
                type: Number,
            },
            lottery_tickets: {
                type: Number,
            }
        }],
    due: {
        type: Number,
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('ContestEdits', ContestEditSchema);
