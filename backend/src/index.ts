import { sendMail } from './utils/mailer';
import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session'
import { createClient } from 'redis'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import cors from 'cors'
import http from 'http'
import fs from 'fs'
import { Server } from "socket.io";

// Import https proxy agent

import https from 'https'
import dotenv from 'dotenv'
import { engine } from 'express-handlebars';





require('./utils/passport')

const RedisStore = require('connect-redis')(session)

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000

// Make sure express can handle upto 50mb of data
app.use((req, res, next) => {
    if (req.originalUrl === '/payment/webhook') {
        console.log(req.body)
        next()
    } else {
        express.json({ limit: '50mb' })(req, res, next)
    }
})
app.use(
    express.urlencoded({
        extended: true,
    })
)
// Redis Client Setup
const redisClient = createClient({
    legacyMode: true,
    url: process.env.REDIS_URI,
})

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(session({
    proxy: true,
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true, sameSite: 'none' },
    resave: false,
    store: new RedisStore({
        client: redisClient
    })
}));
app.use(passport.authenticate('session'))
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.get('/', (req, res) => {
    console.log("HERE   ")
    res.status(200).json({ message: 'Joridiro Backend' })
})

// Routes
import userRouter from './routes/user.router'
import contestRouter from './routes/contest.router'
import messageRouter from './routes/message.router'
import paymentRouter from './routes/payment.router';
import contestCronJobs from './utils/contestcronjobs';

app.use('/user', userRouter)
app.use('/contest', contestRouter)
app.use('/payment', paymentRouter)
app.use('/message', messageRouter)




const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log('✅ | Connected to MongoDB')
    } catch (err) {
        console.log("❌ | Could not connect to MongoDB")
        process.exit(0)
    }
    await contestCronJobs()
    try {
        await redisClient.connect()
        redisClient.on('error', (err) => {
            console.log(err)
        })
        console.log('✅ | Connected to Redis')
    } catch (err) {
        console.log("❌ | Could not connect to Redis")
        process.exit(0)
    }
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
        let server = http.createServer(app)
        const io = require('socket.io')(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        server.listen(PORT, () => {
            console.log(`✅ | Server started on port with http ${PORT}`)
        })
        return io
    } else {
        const options = {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem')
        }
        let server = https.createServer(options, app)
        const io = require('socket.io')(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        server.listen(PORT, () => {
            console.log(`✅ | Server started on port with https ${PORT}`)
        })
        return io
    }
}



const io = startServer()
let users = new Map()
io.then((ioRes) => {
    ioRes?.on('connection', (socket: any) => {
        // Attach the user id to the socket
        console.log(users)
        socket.on('assign_user', (user: any) => {
            console.log("USER: ", user )
            users.set(user, socket.id)
            console.log("USERS: ", users)
        })
        socket.on('message', (msg) => {
            ioRes.to(users.get(msg.receiver)).emit('message', msg)
        })
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
})
export {
    redisClient,
    io
}