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
exports.authGuard = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const authGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated() || !req.user)
        return res.status(401).send({
            msg: 'UNAUTHORIZED'
        });
    // Check if the user is an admin
    const user = yield user_model_1.default.findById(req.user._id);
    if (!user)
        return res.status(401).send({
            msg: 'UNAUTHORIZED'
        });
    // Check if the user is an admin
    if (user.sys_permissions.includes['ADMIN'])
        return next();
    return res.status(401).send({
        msg: 'UNAUTHORIZED'
    });
});
exports.authGuard = authGuard;
