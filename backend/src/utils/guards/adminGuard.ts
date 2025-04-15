import { Request, Response, NextFunction } from 'express'
import userModel from "../../models/user.model";

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() || !req.user) return res.status(401).send({
        msg: 'UNAUTHORIZED'
    })
    // Check if the user is an admin
    const user = await userModel.findById(req.user._id)
    if(!user) return res.status(401).send({
        msg: 'UNAUTHORIZED'
    })

    // Check if the user is an admin
    if (user.sys_permissions.includes['ADMIN']) return next()
    return res.status(401).send({
        msg: 'UNAUTHORIZED'
    })
}