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
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const authGuard_1 = require("../utils/guards/authGuard");
const user_validator_1 = __importDefault(require("../validators/user.validator"));
const router = express_1.default.Router();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return user_validator_1.default.register(req.body).then(data => {
        data.valid ? user_controller_1.default.register(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data });
    });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return user_validator_1.default.login(req.body).then(data => {
        data.valid ? user_controller_1.default.login(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data });
    });
}));
router.post('/me', user_controller_1.default.me);
router.post('/sendOTP', authGuard_1.authGuard, user_controller_1.default.sendOTP);
router.post('/verifyOTP/:otp', authGuard_1.authGuard, user_controller_1.default.verifyOTP);
router.post('/logout', authGuard_1.authGuard, user_controller_1.default.logout);
router.post('/forgotPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return user_validator_1.default.forgotPassword(req.body).then(data => {
        data.valid ? user_controller_1.default.createForgotPasswordOTP(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data });
    });
}));
router.post('/resetPassword/:otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return user_validator_1.default.resetPassword(req.body).then(data => {
        data.valid ? user_controller_1.default.resetPassword(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data });
    });
}));
router.post('/profile/update', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    user_validator_1.default.profileUpdate(req.body).then(data => {
        data.valid ? user_controller_1.default.profile(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data });
    });
}));
router.get('/contests', authGuard_1.authGuard, user_controller_1.default.contests);
router.post('/contact', user_controller_1.default.contact);
exports.default = router;
