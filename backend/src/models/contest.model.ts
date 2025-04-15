import { Schema, model, Document } from 'mongoose';

const ContestSchema = new Schema({
    _id: {
        type: String, 
        required: true,
    },
    organizer: {
        type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        participants_reached: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }]
    },
    lotteryPrize: {
        amount: {
            type: Number,
            required: true,
        },
        winner: {
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        participants_reached: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }]
    }],
    open: {
        type: Boolean,
        default: true,
    },
    title:{
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
        additional:[{
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
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'Participant',
        },
        score: [{
            category: {
                type: Schema.Types.ObjectId,
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
    payment_status:{
        type: String,
        enum: ['PENDING', 'PAID', 'UNPAID'],
    }
}, { timestamps: true })

export interface IContest extends Document {
    organizer: string;
    startDate: Date;
    endDate: Date;
    organizer_platform: string;
    grandPrize: {
        amount: number;
        winner: string;
        participants_reached: string[];
    };
    lotteryPrize: {
        amount: number;
        winner: string;
    };
    faq: {
        questioner: string;
        question: string;
        answer: string;
    }[];
    milestones: {
        _id: any;
        same_type: boolean;
        date: Date;
        points: number;
        prize: number;
        winner: string;
        participants_reached: string[];
    }[];
    open: boolean;
    title: string;
    banner: string;
    type: string;
    size: string;
    score: {
        name: string;
        number: number;
        points: number;
        measuring_unit: string;
        description: string;
    }[];
    questions: {
        question: string;
        answers: string[];
    } [];
    rules: {
        name: string;
    }[];
    about_contest: {
        short_description: string;
        target_audience: string;
        purpose: string;
        how_to_win: string;
        boost: string;
        tags: string[];
    };
    announcements: {
        announcement: string;
        date: Date;
    }[];
    requirements: {
        categories: string[];
        roles: string[];
        countries: string[];
        additional:[{
            name: string;
            description: string;
        }]
    }[];
    about_company: {
        name: string;
        link: string;
        logo: string;
        description: string;
    };
    participants: {
        _id: string;
        score: {
            category: string;
            value: number;
            points: number;
        }[];
        lottery_tickets: number;
        last_updated: Date;
        alias: string;
        profile: string;
    }[];
    payment_status: 'PENDING' | 'PAID' | 'UNPAID';
}

export default model<IContest>('Contest', ContestSchema)

