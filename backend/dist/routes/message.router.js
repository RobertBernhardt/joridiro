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
const message_controller_1 = __importDefault(require("../controllers/message.controller"));
const authGuard_1 = require("../utils/guards/authGuard");
const message_validator_1 = __importDefault(require("../validators/message.validator"));
const router = express_1.default.Router();
router.post('/send', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return message_validator_1.default.send(req.body).then((data) => {
        if (data.valid) {
            return message_controller_1.default.send(req, res);
        }
        else {
            return res.status(400).json({ message: 'VALIDATION_ERROR', data: data.data });
        }
    });
}));
router.get('/:reciever', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return message_controller_1.default.getMessages(req, res); }));
router.get('/user/all', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return message_controller_1.default.getAllUsersMessaged(req, res); }));
router.get('/user/:id', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return message_controller_1.default.getUserData(req, res); }));
router.post('/read/:receiver', authGuard_1.authGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return message_controller_1.default.markAsRead(req, res); }));
exports.default = router;
