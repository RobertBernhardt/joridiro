"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', UserSchema);
