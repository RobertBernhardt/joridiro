"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const router = express_1.default.Router();
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => payment_controller_1.default.webhook(req, res));
router.post('/:id', (req, res) => payment_controller_1.default.payment(req, res));
exports.default = router;
