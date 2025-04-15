import { Schema, model, Document } from 'mongoose';

const ParticipantSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    contest: {
        type: Schema.Types.ObjectId,
        ref: 'Contest',
    },
    score: [{
        category: {
            type: Schema.Types.ObjectId,
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
}, { timestamps: true })

export interface IParticipant extends Document {
    user: string;
    contest: string;
    score: {
        points: number;
        date: Date;
        rank: number;
    }[];
}

export default model<IParticipant>('Participant', ParticipantSchema)