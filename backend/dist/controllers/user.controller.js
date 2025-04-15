"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailer_1 = require("./../utils/mailer");
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const __1 = require("..");
const uuid_1 = require("uuid");
const storage_1 = require("@google-cloud/storage");
const contest_model_1 = __importDefault(require("../models/contest.model"));
const storage = new storage_1.Storage({
    projectId: 'joridiro',
    keyFilename: 'src/joridirokey.json'
});
const uploadImage = (file, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  > Upload the image to google cloud storage
        const bucket = storage.bucket('joridiro_users');
        //The extension of the file is extracted from the base64 string and the file is saved with the same extension from data:image/png
        const extension = file.split(';')[0].split('/')[1];
        // Find the avatarUrl of the user and delete the image from the bucket
        const blob = bucket.file(`${id}.${extension}`);
        const blobStream = blob.createWriteStream({
            resumable: false
        });
        let commaIndex = file.indexOf(",");
        const base64 = file.substring(commaIndex + 1);
        const buffer = Buffer.from(base64, 'base64');
        blobStream.on('error', (err) => {
            console.log(err);
        });
        blobStream.on('finish', () => {
            console.log('Image uploaded successfully');
        });
        blobStream.end(buffer);
        //  > Get the image url
        const publicUrl = `https://storage.cloud.google.com/joridiro_users/${id}.${extension}`;
        return publicUrl;
    }
    catch (err) {
        console.log(err);
        return '';
    }
});
const Handlebars = require('handlebars');
const userController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { fullName, email, password, role } = req.body;
            // > Check if user already exists
            const user = yield user_model_1.default.findOne({ email });
            if (user)
                return res.status(400).json({ type: "ERROR", message: "The email already exists in the database" });
            // > Hash the password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            // > Save user to database
            const newUser = new user_model_1.default({
                fullName,
                email,
                password: hashedPassword,
                sys_permissions: [],
                email_verified: false,
                admin_verified: false,
                contests: [],
            });
            yield newUser.save();
            return res.status(201).json({ type: 'SUCCESS', message: "You have been successfully registered to Joridiro" });
        }
        catch (err) {
            return res.status(500).json({ type: "ERROR", message: "Something went wrong. Please try again later" });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            // > Check if user is already logged in
            if (req.isAuthenticated())
                return res.status(400).json({ type: "ERROR", message: "You are already logged in to Joridiro" });
            // > Check if user exists
            const user = yield user_model_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ type: "ERROR", message: "The user does not exist in our database" });
            // > Check if password is correct
            const validPassword = yield bcryptjs_1.default.compare(password, user.password);
            if (!validPassword)
                return res.status(400).json({ type: "ERROR", message: "Your credentials are incorrect. Please try again" });
            // > New object with only the required data
            const userObject = {
                _id: user._id
            };
            // > If there is a session for the user, return the session
            req.login(userObject, (err) => {
                if (err)
                    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
                return res.status(200).json({ type: 'SUCCESS', message: "You have been successfully logged in" });
            });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    sendOTP: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            let otp = '';
            // > If req.user exists, then the user is logged in. This is kinda redundant cuz the authGuard middleware already checks if the user is logged in or not but, typescript is complaining so, I'm just gonna leave it here. Who cares.
            if (!req.user)
                return res.status(400).json({ message: 'NOT_LOGGED_IN' });
            // > Save the OTP to redis and delete it if it's not used within 5 minutes and also delete if it already exists
            const otpAlreadyExists = yield __1.redisClient.v4.get(`otp:${req.user._id}`);
            if (!otpAlreadyExists) {
                // > Generate a new OTP
                otp = (0, uuid_1.v4)();
                yield __1.redisClient.v4.set(`otp:${req.user._id}`, otp);
                yield __1.redisClient.v4.expire(`otp:${req.user._id}`, 300);
            }
            else {
                otp = otpAlreadyExists;
            }
            if (req.user.verified)
                return res.status(400).json({ message: 'ALREADY_VERIFIED' });
            (0, mailer_1.sendMail)(req.user.email, '3094cd1d-c239-44d4-a339-2c949a689101', {
                action_url: `${(_a = process.env.CLIENT_URL) === null || _a === void 0 ? void 0 : _a.split(',')[0]}/verify/${otp}`
            });
            return res.status(200).json({ message: 'SUCCESS' });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    verifyOTP: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { otp } = req.params;
            // > If req.user exists, then the user is logged in. This is kinda redundant cuz the authGuard middleware already checks if the user is logged in or not but, typescript is complaining so, I'm just gonna leave it here. Who cares.
            if (!req.user)
                return res.status(400).json({ message: 'NOT_LOGGED_IN' });
            // > Check if the OTP is correct
            const correctOTP = yield __1.redisClient.v4.get(`otp:${req.user._id}`);
            if (!correctOTP)
                return res.status(400).json({ message: 'OTP_EXPIRED' });
            if (correctOTP !== otp)
                return res.status(400).json({ message: 'INVALID_OTP' });
            // > Delete the OTP from redis
            yield __1.redisClient.v4.del(`otp:${req.user._id}`);
            // > Update the user's verified status to true
            yield user_model_1.default.findByIdAndUpdate(req.user._id, { email_verified: true });
            // > Update the redis cache
            req.user.email_verified = true;
            return res.status(200).json({ message: 'SUCCESS' });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // > Check if the user is logged in
            if (!req.isAuthenticated())
                return res.status(400).send({
                    msg: "USER_NOT_LOGGED_IN"
                });
            // > Logout the user
            req.session.destroy((err) => {
                if (err)
                    return res.status(400).send(err);
                return res.status(200).send({
                    msg: "LOGGED_OUT_SUCCESSFULLY"
                });
            });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    createForgotPasswordOTP: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const { email } = req.body;
            // > Check if the user exists
            const user = yield user_model_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ type: "ERROR", message: "The user does not exist in our database" });
            // > Generate a new OTP
            const otp = (0, uuid_1.v4)();
            // > Save the OTP to redis and delete it if it's not used within 5 minutes
            yield __1.redisClient.v4.set(`forgot_password_otp:${otp}`, user.email);
            yield __1.redisClient.v4.expire(`forgot_password_otp:${otp}`, 300);
            // > Send the email
            (0, mailer_1.sendMail)(req.body.email, '0912ac6d-eb82-4218-8ead-4a961bed66f8', {
                action_url: `${(_b = process.env.CLIENT_URL) === null || _b === void 0 ? void 0 : _b.split(',')[0]}/changepassword/${otp}`
            });
            return res.status(200).json({ type: 'SUCCESS', message: "A password reset link has been set to your email" });
        }
        catch (err) {
            return res.status(500).json({ type: 'ERROR', message: "Something went wrong", error: err.message });
        }
    }),
    me: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.isAuthenticated())
                return res.status(400).json({ message: 'NOT_LOGGED_IN' });
            return res.status(200).json({ message: 'SUCCESS', user: req.user });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const otp = req.params.otp;
            const { password } = req.body;
            const email = yield __1.redisClient.v4.get(`forgot_password_otp:${otp}`);
            if (!email)
                return res.status(400).json({ type: 'ERROR', message: 'The OTP is invalid or has expired' });
            // > Hash the password
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            // > Update the user's password
            yield user_model_1.default.findOne({ email }).updateOne({ password: hashedPassword });
            // > Delete the OTP from redis
            yield __1.redisClient.v4.del(`forgot_password_otp:${otp}`);
            return res.status(200).json({ type: 'SUCCESS', message: 'Password reset successfully' });
        }
        catch (err) {
            return res.status(500).json({ type: 'ERROR', message: 'Something went wrong', error: err.message });
        }
    }),
    profile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user)
                return res.status(400).json({ message: 'USER_NOT_FOUND' });
            user.fullName = req.body.fullName;
            user.country = req.body.country;
            user.city = req.body.city;
            user.street = req.body.street;
            user.zip_code = req.body.zip_code;
            user.vat_id = req.body.vat_id;
            user.tax_id = req.body.tax_id;
            if (req.body.pfp != user.pfp) {
                user.pfp = yield uploadImage(req.body.pfp, user._id);
            }
            yield user.save();
            return res.status(200).json({ message: 'SUCCESS', user: req.user });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    contests: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user)
                return res.status(400).json({ type: "ERROR", message: "User has not been found" });
            let contests = yield Promise.all(user.contests.map((contest) => __awaiter(void 0, void 0, void 0, function* () {
                // > Get the contest id organizer start date, end date, size, type, title, payment_status, open, the participant info from contest.participants array 
                const contestInfo = yield contest_model_1.default.findById(contest).select('organizer startDate endDate size type title payment_status open participants');
                if (!contestInfo)
                    return;
                // > Get the participant info from contest.participants array
                const participantInfo = contestInfo.participants.find((participant) => participant._id.toString() === req.user._id.toString());
                // > Get the rank of the user in participants array
                const rank = contestInfo.participants.findIndex((participant) => participant._id.toString() === req.user._id.toString()) + 1;
                // > Get the max score of the contest
                const max = contestInfo.participants[0];
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
                };
            })));
            return res.status(200).json({ message: 'SUCCESS', data: contests });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    }),
    contact: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Send the email to the admin
            const html = `
                <h1>Contact</h1>
                <p>Name: ${req.body.name}</p>
                <p>Email: ${req.body.email}</p>
                <p>Subject: ${req.body.subject}</p>
                <p>Message: ${req.body.comment}</p>
            `;
            (0, mailer_1.receiveEmail)(process.env.ADMIN_EMAIL, 'Contact', html);
            return res.status(200).json({ type: 'SUCCESS', message: 'Email sent successfully' });
        }
        catch (err) {
            return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', error: err.message });
        }
    })
};
exports.default = userController;
