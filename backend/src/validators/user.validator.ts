import { Request, Response } from "express";
import { IUser } from "../models/user.model";
import * as yup from 'yup'

const userValidator = {
    register: async (data: IUser): Promise<{ valid: boolean, data?: string[] }> => {
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
            })
            const res = await schema.validate(data, { abortEarly: false })
            return { valid: true }
        } catch (err) {
            return { valid: false, data: err.errors }
        }
    },

    login: async (data: IUser): Promise<{ valid: boolean, data?: string[] }> => {
        try {
            const schema = yup.object().shape({
                email: yup.string().email().required(),
                password: yup.string().required()
            })
            const res = await schema.validate(data, { abortEarly: false })
            return { valid: true }
        } catch (err) {
            return { valid: false, data: err.errors }
        }
    },
    forgotPassword: async (data: IUser): Promise<{ valid: boolean, data?: string[] }> => {
        try {
            const schema = yup.object().shape({
                email: yup.string().email().required()
            })
            const res = await schema.validate(data, { abortEarly: false })
            return { valid: true }
        } catch (err) {
            return { valid: false, data: err.errors }
        }
    },
    resetPassword: async (data: IUser): Promise<{ valid: boolean, data?: string[] }> => {
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
            })
            const res = await schema.validate(data, { abortEarly: false })
            return { valid: true }
        } catch (err) {
            return { valid: false, data: err.errors }
        }
    },
    profileUpdate: async (data: IUser): Promise<{ valid: boolean, data?: string[] }> => {
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
            })
            const res = await schema.validate(data, { abortEarly: false })
            return { valid: true }
        } catch (err) {
            return { valid: false, data: err.errors }
        }
    }
}


export default userValidator