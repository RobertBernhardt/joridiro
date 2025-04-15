import { Schema, model, Document } from 'mongoose';

const UserSchema = new Schema({
    pfp: {
        type: String,
    },
   fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    street: {
        type: String,
    },
    zip_code: {
        type: String,
    },
    vat_id: {
        type: String,
    },
    tax_id: {
        type: String,
    },
    sys_permissions: {
        type: [String],
        required: true,
        default: []
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    admin_verified: {
        type: Boolean,
        default: false
    },
    contests: [{
        type: String,
        ref: 'Contest'
    }]
}, { timestamps: true })

export interface IUser extends Document {
    pfp: string,
    fullName: string,
    email: string,
    password: string,
    email_verified: boolean,
    sys_permissions: string[],
    admin_verified: boolean,
    contests: string[],
    city: string,
    country: string,
    street: string,
    zip_code: string,
    vat_id: string,
    tax_id: string,
}

export default model<IUser>('User', UserSchema)