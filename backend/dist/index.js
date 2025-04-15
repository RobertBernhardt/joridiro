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
exports.io = exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
// Import https proxy agent
const https_1 = __importDefault(require("https"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_handlebars_1 = require("express-handlebars");
require('./utils/passport');
const RedisStore = require('connect-redis')(express_session_1.default);
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Make sure express can handle upto 50mb of data
app.use((req, res, next) => {
    if (req.originalUrl === '/payment/webhook') {
        console.log(req.body);
        next();
    }
    else {
        express_1.default.json({ limit: '50mb' })(req, res, next);
    }
});
app.use(express_1.default.urlencoded({
    extended: true,
}));
// Redis Client Setup
const redisClient = (0, redis_1.createClient)({
    legacyMode: true,
    url: process.env.REDIS_URI,
});
exports.redisClient = redisClient;
// Middleware
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    proxy: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true, sameSite: 'none' },
    resave: false,
    store: new RedisStore({
        client: redisClient
    })
}));
app.use(passport_1.default.authenticate('session'));
app.engine('handlebars', (0, express_handlebars_1.engine)());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.get('/', (req, res) => {
    console.log("HERE   ");
    res.status(200).json({ message: 'Joridiro Backend' });
});
// Routes
const user_router_1 = __importDefault(require("./routes/user.router"));
const contest_router_1 = __importDefault(require("./routes/contest.router"));
const message_router_1 = __importDefault(require("./routes/message.router"));
const payment_router_1 = __importDefault(require("./routes/payment.router"));
const contestcronjobs_1 = __importDefault(require("./utils/contestcronjobs"));
app.use('/user', user_router_1.default);
app.use('/contest', contest_router_1.default);
app.use('/payment', payment_router_1.default);
app.use('/message', message_router_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('✅ | Connected to MongoDB');
    }
    catch (err) {
        console.log("❌ | Could not connect to MongoDB");
        process.exit(0);
    }
    yield (0, contestcronjobs_1.default)();
    try {
        yield redisClient.connect();
        redisClient.on('error', (err) => {
            console.log(err);
        });
        console.log('✅ | Connected to Redis');
    }
    catch (err) {
        console.log("❌ | Could not connect to Redis");
        process.exit(0);
    }
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
        let server = http_1.default.createServer(app);
        const io = require('socket.io')(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        server.listen(PORT, () => {
            console.log(`✅ | Server started on port with http ${PORT}`);
        });
        return io;
    }
    else {
        const options = {
            key: fs_1.default.readFileSync('key.pem'),
            cert: fs_1.default.readFileSync('cert.pem')
        };
        let server = https_1.default.createServer(options, app);
        const io = require('socket.io')(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        server.listen(PORT, () => {
            console.log(`✅ | Server started on port with https ${PORT}`);
        });
        return io;
    }
});
const io = startServer();
exports.io = io;
let users = new Map();
io.then((ioRes) => {
    ioRes === null || ioRes === void 0 ? void 0 : ioRes.on('connection', (socket) => {
        // Attach the user id to the socket
        console.log(users);
        socket.on('assign_user', (user) => {
            console.log("USER: ", user);
            users.set(user, socket.id);
            console.log("USERS: ", users);
        });
        socket.on('message', (msg) => {
            ioRes.to(users.get(msg.receiver)).emit('message', msg);
        });
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
});
