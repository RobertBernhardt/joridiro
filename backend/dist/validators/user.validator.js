"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const userValidator = {
    register: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                fullName: yup.string().required(),
                email: yup.string().email().required(),
                password: yup
                    .string()
                    .required('Password is required')
                    .min(10, 'Password must be at least 10 characters')
                    .max(50, 'Password must be at most 50 characters')
                    .matches(/(?=.*[A-Z])/, 'Password must contain one uppercase letter')
                    .matches(/(?=.*[a-z])/, 'Password must contain one lowercase letter')
                    .matches(/(?=.*[0-9])/, 'Password must contain one number')
                    .matches(/(?=.*[!@#$%_^&*])/, 'Password must contain one special character'),
                confirmPassword: yup
                    .string()
                    .required('Confirm password is required')
                    .oneOf([yup.ref('password'), null], 'Passwords must match'),
            });
            const res = yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    login: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                email: yup.string().email().required(),
                password: yup.string().required()
            });
            const res = yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    forgotPassword: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                email: yup.string().email().required()
            });
            const res = yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    resetPassword: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                password: yup
                    .string()
                    .required('Password is required')
                    .min(10, 'Password must be at least 10 characters')
                    .max(50, 'Password must be at most 50 characters')
                    .matches(/(?=.*[A-Z])/, 'Password must contain one uppercase letter')
                    .matches(/(?=.*[a-z])/, 'Password must contain one lowercase letter')
                    .matches(/(?=.*[0-9])/, 'Password must contain one number')
                    .matches(/(?=.*[!@#$%_^&*])/, 'Password must contain one special character'),
                confirmPassword: yup
                    .string()
                    .required('Confirm password is required')
                    .oneOf([yup.ref('password'), null], 'Passwords must match')
            });
            const res = yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    }),
    profileUpdate: (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const schema = yup.object().shape({
                fullName: yup.string().required("Required"),
                email: yup.string().email(),
                country: yup.string(),
                city: yup.string(),
                street: yup.string(),
                zip_code: yup.string(),
                vat_id: yup.string(),
                tax_id: yup.string()
            });
            const res = yield schema.validate(data, { abortEarly: false });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, data: err.errors };
        }
    })
};
exports.default = userValidator;
