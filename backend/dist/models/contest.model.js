"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContestSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
    },
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    organizer_platform: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    grandPrize: {
        amount: {
            type: Number,
            required: true,
        },
        winner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
        participants_reached: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            }]
    },
    lotteryPrize: {
        amount: {
            type: Number,
            required: true,
        },
        winner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    milestones: [{
            same_type: {
                type: Boolean,
                default: true
            },
            date: {
                type: Date,
            },
            points: {
                type: Number,
            },
            prize: {
                type: Number,
            },
            winner: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            participants_reached: [{
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'User',
                }]
        }],
    open: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: ['SCORE', 'DEADLINE'],
    },
    size: {
        type: String,
        required: true,
        enum: ['SMALL', 'MEDIUM', 'LARGE', 'TEST'],
    },
    score: [{
            name: {
                type: String,
                required: true,
            },
            number: {
                type: Number,
                required: true,
            },
            points: {
                type: Number,
                required: true,
            },
            measuring_unit: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
        }],
    questions: [{
            question: {
                type: String,
                required: true,
            },
            answers: {
                type: [String],
            }
        }],
    rules: [{
            type: String,
        }],
    about_contest: {
        short_description: {
            type: String,
            required: true,
        },
        target_audience: {
            type: String,
        },
        purpose: {
            type: String,
        },
        how_to_win: {
            type: String,
        },
        boost: {
            type: String,
        },
        tags: {
            type: [String],
        }
    },
    requirements: {
        categories: {
            type: [String],
            required: true,
        },
        countries: {
            type: [String],
            required: true,
        },
        roles: {
            type: [String],
            required: true,
        },
        additional: [{
                name: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
            }]
    },
    about_company: {
        name: {
            type: String,
        },
        link: {
            type: String,
        },
        logo: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    announcements: [{
            announcement: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now(),
            },
        }],
    faq: [{
            questioner: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
            question: {
                type: String,
            },
            answer: {
                type: String,
            },
        }],
    participants: [{
            _id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Participant',
            },
            score: [{
                    category: {
                        type: mongoose_1.Schema.Types.ObjectId,
                    },
                    value: {
                        type: Number,
                    },
                    points: {
                        type: Number,
                    },
                }],
            lottery_tickets: {
                type: Number,
            },
            last_updated: {
                type: Date,
            },
            alias: {
                type: String,
                default: "John Doe",
            },
            link: {
                type: String,
            }
        }],
    payment_status: {
        type: String,
        enum: ['PENDING', 'PAID', 'UNPAID'],
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Contest', ContestSchema);
