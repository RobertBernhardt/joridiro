import { Schema, model, Document } from 'mongoose';

const ContestEditSchema = new Schema({
    organizer: {
        type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId || null,
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
                type: Schema.Types.ObjectId || null,
                ref: 'User',
            },
        }],
        lottery: {
            amount: {
                type: Number,
                required: true,
            },
            winner: {
                type: Schema.Types.ObjectId || null,
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
                type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'Participant',
        },
        score: {
            type: Number,
        },
        lottery_tickets: {
            type: Number,
        }
    }],
    due:{
        type: Number,
    }
}, { timestamps: true })

export interface IContestEdits extends Document {
    organizer: string;
    banner: string;
    open: boolean;
    awarded: boolean;
    title: string;
    shortDescription: string;
    startDate: Date;
    endDate: Date;
    type: string;
    company: {
        title: string;
        link: string;
        description: string;
        logo: string;
    };
    targetScore: number;
    about: {
        text: {
            title: string;
            description: string;
        }[];
        media: {
            images: string[];
            videos: string[];
        }
    };
    announcements: {
        title: string;
        description: string;
        date: Date;
    }[];
    requirements: string[];
    howToJoin: string[];
    rules: string[];
    prizes: {
        currency: string;
        rankPrizes: {
            rank: number;
            amount: number;
            winner: string | null;
        }[];
        milestones: {
            date: Date;
            score: Number;
            amount: Number;
            winner: string | null;
        }[];
        lottery: {
            amount: number;
            winner: string | null;
        };
    };
    boosts: {
        description: string;
        list: [string];
    };
    participantQuestions: {
        questions: string;
        options: string[];
    }[];
    participants: {
        _id: string;
        score: number;
        lottery_tickets: number;
    }[];
    faq: {
        question: string;
        answer: {
            text: string | null;
            answeredBy: string | null;
        };
    }[];
    due: number;
}

export default model<IContestEdits>('ContestEdits', ContestEditSchema)

