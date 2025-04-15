import { Request, Response } from "express";
import { IUser } from "../models/user.model";
import * as yup from 'yup'

const messageValidator = {
    send: async (data: IUser): Promise<{valid: boolean, data?: string[]}> => {
        try{
            const schema = yup.object().shape({
                receiver: yup.string().required(),
                message: yup.string(),
                read: yup.boolean()
            })
            const res = await schema.validate(data, {abortEarly: false})
            // > Make sure either the message or the attachments are present
            if(!res.message && !res.attachments) return {valid: false, data: ['Either the message or the attachments are required']}
            return {valid: true}
        } catch(err){
            return {valid: false, data: err.errors}
        }
    },
}


export default messageValidator