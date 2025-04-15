"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const authGuard = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    return res.status(401).send({
        msg: 'UNAUTHORIZED'
    });
};
exports.authGuard = authGuard;
