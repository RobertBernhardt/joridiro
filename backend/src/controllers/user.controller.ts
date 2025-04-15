import { receiveEmail, sendMail } from './../utils/mailer';
import { Request, Response } from "express"
import userModel from "../models/user.model"
import bcrypt from 'bcryptjs'
import { redisClient } from ".."
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import passport from 'passport';
import { Storage } from '@google-cloud/storage';
import contestModel from '../models/contest.model';

const storage = new Storage({
    projectId: 'joridiro',
    keyFilename: 'src/joridirokey.json'
})

const uploadImage = async (file: string, id: string) => {
    try {
        //  > Upload the image to google cloud storage
        const bucket = storage.bucket('joridiro_users')
        //The extension of the file is extracted from the base64 string and the file is saved with the same extension from data:image/png
        const extension = file.split(';')[0].split('/')[1]
        // Find the avatarUrl of the user and delete the image from the bucket

        const blob = bucket.file(`${id}.${extension}`)
        const blobStream = blob.createWriteStream({
            resumable: false
        })
        let commaIndex = file.indexOf(",");
        const base64 = file.substring(commaIndex + 1);
        const buffer = Buffer.from(base64, 'base64')
        blobStream.on('error', (err: any) => {
            console.log(err)
        })
        blobStream.on('finish', () => {
            console.log('Image uploaded successfully')
        })
        blobStream.end(buffer)
        //  > Get the image url
        const publicUrl = `https://storage.cloud.google.com/joridiro_users/${id}.${extension}`
        return publicUrl
    } catch (err) {
        console.log(err)
        return ''
    }
}


const Handlebars = require('handlebars')
const userController = {
    register: async (req: Request, res: Response) => {
        try {
            const { fullName, email, password, role } = req.body

            // > Check if user already exists
            const user = await userModel.findOne({ email })
            if (user) return res.status(400).json({ type: "ERROR", message: "The email already exists in the database" })

            // > Hash the password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            // > Save user to database
            const newUser = new userModel({
                fullName,
                email,
                password: hashedPassword,
                sys_permissions: [],
                email_verified: false,
                admin_verified: false,
                contests: [],
            })
            await newUser.save()
            return res.status(201).json({ type: 'SUCCESS', message: "You have been successfully registered to Joridiro" })
        } catch (err) {
            return res.status(500).json({ type: "ERROR", message: "Something went wrong. Please try again later" })

        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            // > Check if user is already logged in
            if (req.isAuthenticated()) return res.status(400).json({ type: "ERROR", message: "You are already logged in to Joridiro" })
            // > Check if user exists
            const user = await userModel.findOne({ email })
            if (!user) return res.status(400).json({ type: "ERROR", message: "The user does not exist in our database" })

            // > Check if password is correct
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) return res.status(400).json({ type: "ERROR", message: "Your credentials are incorrect. Please try again" })

            // > New object with only the required data
            const userObject = {
                _id: user._id
            }
            // > If there is a session for the user, return the session
            req.login(userObject, (err) => {
                if (err) return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
                return res.status(200).json({ type: 'SUCCESS', message: "You have been successfully logged in" })
            })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })

        }
    },
    sendOTP: async (req: Request, res: Response) => {
        try {
            let otp = ''
            // > If req.user exists, then the user is logged in. This is kinda redundant cuz the authGuard middleware already checks if the user is logged in or not but, typescript is complaining so, I'm just gonna leave it here. Who cares.
            if (!req.user) return res.status(400).json({ type: "ERROR", message: "You are not logged in" })
            if (req.user.email_verified) return res.status(400).json({ type: "ERROR", message: "You have already verified your email" })
            // > Save the OTP to redis and delete it if it's not used within 5 minutes and also delete if it already exists
            const otpAlreadyExists = await redisClient.v4.get(`otp_sent_status:${req.user._id}`)
            if (!otpAlreadyExists) {
                // > Generate a new OTP
                otp = uuidv4()
                await redisClient.v4.set(`otp:${otp}`, req.user._id)
                await redisClient.v4.set(`otp_sent_status:${req.user._id}`, `true`)
                await redisClient.v4.expire(`otp:${otp}`, 600)
                await redisClient.v4.expire(`otp_sent_status:${req.user._id}`, 600)
                sendMail(req.user.email, '3094cd1d-c239-44d4-a339-2c949a689101', {
                    action_url: `${process.env.CLIENT_URL?.split(',')[0]}/verify/${otp}`
                })
            }
            return res.status(200).json({ message: 'SUCCESS' })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
        }
    },
    verifyOTP: async (req: Request, res: Response) => {
        try {
            const { otp } = req.params
            // > Check if the OTP is correct
            const correctOTP = await redisClient.v4.get(`otp:${otp}`)
            if (!correctOTP) return res.status(400).json({ type: "ERROR", message: 'The OTP is invalid' })
            const user = await userModel.findById(correctOTP)
            if (!user) return res.status(400).json({ type: "ERROR", message: 'The OTP is invalid' })
            console.log(user)
            // > Delete the OTP from redis
            await redisClient.v4.del(`otp:${otp}`)
            await redisClient.v4.del(`otp_sent_status:${user._id}`)
            // > Update the user's verified status to true
            user.email_verified = true
            await user.save()
            return res.status(200).json({ type: 'SUCCESS', message: 'Your email has been successfully verified' })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })

        }
    },
    logout: async (req: Request, res: Response) => {
        try {
            // > Check if the user is logged in
            if (!req.isAuthenticated()) return res.status(400).send({
                msg: "USER_NOT_LOGGED_IN"
            })
            // > Logout the user
            req.session.destroy((err) => {
                if (err) return res.status(400).send(err)
                return res.status(200).send({
                    msg: "LOGGED_OUT_SUCCESSFULLY"
                })
            })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })

        }
    },
    createForgotPasswordOTP: async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            // > Check if the user exists
            const user = await userModel.findOne({ email })
            if (!user) return res.status(400).json({ type: "ERROR", message: "The user does not exist in our database" })

            // > Generate a new OTP
            const otp = uuidv4()

            // > Save the OTP to redis and delete it if it's not used within 5 minutes
            await redisClient.v4.set(`forgot_password_otp:${otp}`, user.email)
            await redisClient.v4.expire(`forgot_password_otp:${otp}`, 600)

            // > Send the email
            sendMail(req.body.email, '0912ac6d-eb82-4218-8ead-4a961bed66f8', {
                action_url: `${process.env.CLIENT_URL?.split(',')[0]}/changepassword/${otp}`
            })
            return res.status(200).json({ type: 'SUCCESS', message: "A password reset link has been set to your email" })
        } catch (err) {
            return res.status(500).json({ type: 'ERROR', message: "Something went wrong", error: err.message })
        }
    },
    me: async (req: Request, res: Response) => {
        try {
            if (!req.isAuthenticated()) return res.status(400).json({ message: 'NOT_LOGGED_IN' })
            return res.status(200).json({ message: 'SUCCESS', user: req.user })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
        }
    },
    resetPassword: async (req: Request, res: Response) => {
        try {
            const otp = req.params.otp
            const { password } = req.body

            const email = await redisClient.v4.get(`forgot_password_otp:${otp}`)
            if (!email) return res.status(400).json({ type: 'ERROR', message: 'The OTP is invalid or has expired' })

            // > Hash the password
            const hashedPassword = await bcrypt.hash(password, 10)

            // > Update the user's password
            await userModel.findOne({ email }).updateOne({ password: hashedPassword })

            // > Delete the OTP from redis
            await redisClient.v4.del(`forgot_password_otp:${otp}`)
            return res.status(200).json({ type: 'SUCCESS', message: 'Password reset successfully' })
        } catch (err) {
            return res.status(500).json({ type: 'ERROR', message: 'Something went wrong', error: err.message })

        }
    },
    profile: async (req: Request, res: Response) => {
        try {
            const user = await userModel.findById(req.user._id)
            if (!user) return res.status(400).json({ message: 'USER_NOT_FOUND' })
            user.fullName = req.body.fullName
            user.country = req.body.country
            user.city = req.body.city
            user.street = req.body.street
            user.zip_code = req.body.zip_code
            user.vat_id = req.body.vat_id
            user.tax_id = req.body.tax_id

            if (req.body.pfp != user.pfp) {
                user.pfp = await uploadImage(req.body.pfp, user._id)
            }
            await user.save()
            return res.status(200).json({ message: 'SUCCESS', user: req.user })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
        }
    },
    contests: async (req: Request, res: Response) => {
        try {
            const user = await userModel.findById(req.user._id)
            if (!user) return res.status(400).json({ type: "ERROR", message: "User has not been found" })
            let contests = await Promise.all(user.contests.map(async (contest: any) => {
                // > Get the contest id organizer start date, end date, size, type, title, payment_status, open, the participant info from contest.participants array 
                const contestInfo = await contestModel.findById(contest).select('organizer startDate endDate size type title payment_status open participants')
                if (!contestInfo) return
                // > Get the participant info from contest.participants array
                const participantInfo = contestInfo.participants.find((participant: any) => participant._id.toString() === req.user._id.toString())
                // > Get the rank of the user in participants array
                const rank = contestInfo.participants.findIndex((participant: any) => participant._id.toString() === req.user._id.toString()) + 1
                // > Get the max score of the contest
                const max = contestInfo.participants[0]
                return {
                    contest_id: contestInfo._id,
                    organizer: contestInfo.organizer,
                    start_date: contestInfo.startDate,
                    end_date: contestInfo.endDate,
                    size: contestInfo.size,
                    type: contestInfo.type,
                    title: contestInfo.title,
                    max: max,
                    payment_status: contestInfo.payment_status,
                    open: contestInfo.open,
                    participant: participantInfo,
                    rank: rank
                }
            }))
            return res.status(200).json({ message: 'SUCCESS', data: contests })

        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
        }
    },
    contact: async (req: Request, res: Response) => {
        try {
            // Send the email to the admin
            const html = `
                <h1>Contact</h1>
                <p>Name: ${req.body.name}</p>
                <p>Email: ${req.body.email}</p>
                <p>Subject: ${req.body.subject}</p>
                <p>Message: ${req.body.comment}</p>
            `
            receiveEmail(process.env.ADMIN_EMAIL, 'Contact', html)
            return res.status(200).json({ type: 'SUCCESS', message: 'Email sent successfully' })
        } catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message })
        }
    }
}

export default userController