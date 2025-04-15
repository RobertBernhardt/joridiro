import {Schema, model, Document} from 'mongoose';

const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    attachments: {
        type: [String],
        default: [],
    },
    message: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true})

export interface IMessage extends Document {
    sender: string;
    receiver: string;
    message: string;
    read: boolean;
    attachments: string[];
}

export default model<IMessage>('Message', MessageSchema)