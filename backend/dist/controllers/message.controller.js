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
const messages_model_1 = __importDefault(require("../models/messages.model"));
const { Storage } = require('@google-cloud/storage');
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("../models/user.model"));
const storage = new Storage({
    projectId: 'joridiro',
    keyFilename: 'src/joridirokey.json'
});
const uploadFiles = (file, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  > Upload the image to google cloud storage
        const bucket = storage.bucket('joridiro_contest');
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
        const publicUrl = `https://storage.googleapis.com/joridiro_contest/${id}.${extension}`;
        return publicUrl;
    }
    catch (err) {
        console.log(err);
        return '';
    }
});
const messageController = {
    send: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            // > Sender and receiver are the same
            if (req.user._id == req.body.receiver)
                return res.status(400).json({ message: 'You cannot send a message to yourself' });
            // > Check if there are any attachments
            let attachments = [];
            let promises = [];
            if (req.body.attachments && req.body.attachments.length > 0) {
                req.body.attachments.forEach((attachment) => {
                    const id = (0, uuid_1.v4)();
                    // Push the promise to the array and the result will be stored in the attachments array
                    promises.push(uploadFiles(attachment, id).then((url) => {
                        attachments.push(url);
                    }));
                });
            }
            // > Wait for all the promises to resolve
            yield Promise.all(promises);
            // > Store the message in the database
            const message = yield messages_model_1.default.create({
                sender: req.user._id,
                receiver: req.body.receiver,
                attachments,
                message: req.body.message,
            });
            return res.status(200).json({ message: 'Message sent', data: message });
        }
        catch (err) {
            return res.status(500).json({ message: 'ERROR', error: err.message });
        }
    }),
    getMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            const start = req.query.start ? parseInt(req.query.start) : 0;
            const limit = req.query.limit ? parseInt(req.query.limit) : 15;
            const sender = req.user._id;
            const receiver = req.params.reciever;
            // > Fetch the messages from last to first and then reverse the array
            const messages = yield messages_model_1.default.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender }
                ]
            }).sort({ createdAt: -1 }).skip(start).limit(limit);
            // > Reverse the array
            messages.reverse();
            return res.status(200).json({ message: 'Messages', data: messages });
        }
        catch (err) {
            return res.status(500).json({ message: 'ERROR' });
        }
    }),
    getUserData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            const user = yield user_model_1.default.findById(req.params.id, { fullName: 1, pfp: 1 });
            return res.status(200).json({ message: 'User data', data: user });
        }
        catch (err) {
            return res.status(500).json({ message: 'ERROR' });
        }
    }),
    getAllUsersMessaged: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            // > Find the users who have messaged the current user or the current user has messaged
            const senders = yield messages_model_1.default.distinct('sender', { receiver: req.user._id });
            const receivers = yield messages_model_1.default.distinct('receiver', { sender: req.user._id });
            let users = [...senders, ...receivers];
            // > Remove the current user from the array
            const index = users.indexOf(req.user._id);
            if (index > -1) {
                users.splice(index, 1);
            }
            // > Remove the duplicates without using Set. Convert objectIDs to strings
            users = users.filter((user, index) => {
                return users.indexOf(user) === index;
            });
            users = users.map((user) => user.toString());
            users = [...new Set(users)];
            let usersData = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                const lastMessage = yield messages_model_1.default.findOne({
                    $or: [
                        { sender: req.user._id, receiver: user },
                        { sender: user, receiver: req.user._id }
                    ]
                }).sort({ createdAt: -1 });
                if (!lastMessage)
                    return;
                console.log(lastMessage, user);
                const userData = yield user_model_1.default.findById(user).select({ fullName: 1, pfp: 1 });
                // > Get the number of unread messages with an or query. Just make sure its upto 10 unread messages
                const unreadMessages = yield messages_model_1.default.countDocuments({
                    receiver: req.user._id, sender: req.params.sender, read: false
                }).limit(10);
                if (!userData)
                    return;
                return Object.assign(Object.assign({}, userData._doc), { lastMessage: lastMessage.message, sender: lastMessage.sender, unreadMessages });
            })));
            usersData = usersData.filter((user) => user != null);
            return res.status(200).json({ message: 'Users', data: usersData });
        }
        catch (err) {
            return res.status(500).json({ message: 'Something unexpected occured', error: err.message });
        }
    }),
    markAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        try {
            // > Update all the unread messages to read
            console.log(req.user._id, req.params.sender);
            const messages = yield messages_model_1.default.updateMany({
                sender: req.user._id, receiver: req.params.receiver, read: false
            }, { read: true });
            return res.status(200).json({ message: 'Messages marked as read', data: messages });
        }
        catch (err) {
            return res.status(500).json({ message: 'ERROR' });
        }
    })
};
exports.default = messageController;
