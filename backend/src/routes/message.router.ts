import express from 'express'
import messageController from '../controllers/message.controller'
import { authGuard } from '../utils/guards/authGuard'
import messageValidator from '../validators/message.validator'

const router = express.Router()

router.post('/send', authGuard, async (req, res) => messageValidator.send(
    req.body
).then((data) => {
    if (data.valid) {
        return messageController.send(req, res)
    } else {
        return res.status(400).json({ message: 'VALIDATION_ERROR', data: data.data })
    }
})
)

router.get('/:reciever', authGuard, async (req, res) => messageController.getMessages(req, res))
router.get('/user/all', authGuard, async (req, res) => messageController.getAllUsersMessaged(req, res))
router.get('/user/:id', authGuard, async (req, res) => messageController.getUserData(req, res))
router.post('/read/:receiver', authGuard, async (req, res) => messageController.markAsRead(req, res))
export default router