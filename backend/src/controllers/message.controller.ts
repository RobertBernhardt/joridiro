import { Request, Response } from "express"
import messagesModel from "../models/messages.model"
const { Storage } = require('@google-cloud/storage');
import { v4 as uuidv4 } from 'uuid';
import { io } from "..";
import userModel from "../models/user.model";

const storage = new Storage({
    projectId: 'joridiro',
    keyFilename: 'src/joridirokey.json'
})

const uploadFiles = async (file: string, id: string) => {
    try {
        //  > Upload the image to google cloud storage
        const bucket = storage.bucket('joridiro_contest')
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
        const publicUrl = `https://storage.googleapis.com/joridiro_contest/${id}.${extension}`
        return publicUrl
    } catch (err) {
        console.log(err)
        return ''
    }
}



const messageController = {
    send: async (req: Request, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'UNAUTHORIZED' })
        try {
            // > Sender and receiver are the same
            if (req.user._id == req.body.receiver) return res.status(400).json({ message: 'You cannot send a message to yourself' })
            // > Check if there are any attachments
            let attachments = []
            let promises = []
            if (req.body.attachments && req.body.attachments.length > 0) {
                req.body.attachments.forEach((attachment: any) => {
                    const id = uuidv4()
                    // Push the promise to the array and the result will be stored in the attachments array
                    promises.push(uploadFiles(attachment, id).then((url: string) => {
                        attachments.push(url)
                    }))
                })
            }
            // > Wait for all the promises to resolve
            await Promise.all(promises)
            // > Store the message in the database
            const message = await messagesModel.create({
                sender: req.user._id,
                receiver: req.body.receiver,
                attachments,
                message: req.body.message,
            })
            return res.status(200).json({ message: 'Message sent', data: message })
        } catch (err) {
            return res.status(500).json({ message: 'ERROR', error: err.message })
        }
    },
    getMessages: async (req: Request, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'UNAUTHORIZED' })
        try {
            const start = req.query.start ? parseInt(req.query.start as string) : 0
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 15
            const sender = req.user._id
            const receiver = req.params.reciever

            // > Fetch the messages from last to first and then reverse the array
            const messages = await messagesModel.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender }
                ]
            }).sort({ createdAt: -1 }).skip(start).limit(limit)
            // > Reverse the array
            messages.reverse()
            return res.status(200).json({ message: 'Messages', data: messages })
        } catch (err) {
            return res.status(500).json({ message: 'ERROR' })
        }
    },
    getUserData: async (req: Request, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'UNAUTHORIZED' })
        try {
            const user = await userModel.findById(req.params.id, { fullName: 1, pfp: 1 })
            return res.status(200).json({ message: 'User data', data: user })
        } catch (err) {
            return res.status(500).json({ message: 'ERROR' })
        }
    },
    getAllUsersMessaged: async (req: Request, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'UNAUTHORIZED' })
        try {
            // > Find the users who have messaged the current user or the current user has messaged
            const senders = await messagesModel.distinct('sender', { receiver: req.user._id })
            const receivers = await messagesModel.distinct('receiver', { sender: req.user._id })
            let users = [...senders, ...receivers]
            // > Remove the current user from the array
            const index = users.indexOf(req.user._id)
            if (index > -1) {
                users.splice(index, 1)
            }
            // > Remove the duplicates without using Set. Convert objectIDs to strings
            users = users.filter((user: any, index: number) => {
                return users.indexOf(user) === index
            })
            users = users.map((user: any) => user.toString())
            users = [...new Set(users)]

            let usersData = await Promise.all(users.map(async (user: any) => {
                const lastMessage = await messagesModel.findOne({
                    $or: [
                        { sender: req.user._id, receiver: user },
                        { sender: user, receiver: req.user._id }
                    ]
                }).sort({ createdAt: -1 })
                if (!lastMessage) return
                console.log(lastMessage, user)
                const userData = await userModel.findById(user).select({ fullName: 1, pfp: 1 })
                // > Get the number of unread messages with an or query. Just make sure its upto 10 unread messages
                const unreadMessages = await messagesModel.countDocuments({
                    receiver: req.user._id, sender: req.params.sender, read: false
                }).limit(10)
                if(!userData) return
                return {
                    // @ts-ignore
                    ...userData._doc,
                    lastMessage: lastMessage.message,
                    sender: lastMessage.sender,
                    unreadMessages
                }
            }))
            usersData = usersData.filter((user: any) => user!=null)
            return res.status(200).json({ message: 'Users', data: usersData })
        } catch (err) {
            return res.status(500).json({ message: 'Something unexpected occured', error: err.message })
        }
    },
    markAsRead: async (req: Request, res: Response) => {
        if (!req.user) return res.status(401).json({ message: 'UNAUTHORIZED' })
        try {
            // > Update all the unread messages to read
            console.log(req.user._id, req.params.sender)
            const messages = await messagesModel.updateMany({
                sender: req.user._id, receiver: req.params.receiver, read: false
            }, { read: true })
            return res.status(200).json({ message: 'Messages marked as read', data: messages })
        } catch (err) {
            return res.status(500).json({ message: 'ERROR' })
        }
    }
}

export default messageController    