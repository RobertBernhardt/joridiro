import { Schema, model, Document } from 'mongoose';

const ContestCronSchema = new Schema({
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
                type: Schema.Types.ObjectId,
                required: false,
            }
        },
    ],
}, { timestamps: true })

export interface IContestCron extends Document {
    _id: Date;
    contests: {
        date: Date;
        contest_id: string;
        type: string;
        milestone_id?: string;
    }[]
}

export default model<IContestCron>('ContestCron', ContestCronSchema)