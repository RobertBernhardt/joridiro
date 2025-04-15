import express from 'express'
import userController from '../controllers/user.controller'
import { authGuard } from '../utils/guards/authGuard'
import userValidator from '../validators/user.validator'

const router = express.Router()


router.post('/register', async (req, res) =>
    userValidator.register(req.body).then(data => {
        data.valid ? userController.register(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data })
    })
)

router.post('/login', async (req, res) =>
    userValidator.login(req.body).then(data => {
        data.valid ? userController.login(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data })
    })
)
router.post('/me', userController.me)
router.post('/sendOTP', authGuard, userController.sendOTP)

router.post('/verifyOTP/:otp', userController.verifyOTP)

router.post('/logout', authGuard, userController.logout)

router.post('/forgotPassword', async (req, res) =>
    userValidator.forgotPassword(req.body).then(data => {
        data.valid ? userController.createForgotPasswordOTP(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data })
    }))

router.post('/resetPassword/:otp', async (req, res) =>
    userValidator.resetPassword(req.body).then(data => {
        data.valid ? userController.resetPassword(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data })
    }))

router.post('/profile/update', authGuard, async (req,res) => {
    userValidator.profileUpdate(req.body).then(data => {
        data.valid ? userController.profile(req, res) : res.status(400).json({ message: 'ERRORS', data: data.data })
    })
})
router.get('/contests', authGuard, userController.contests)
router.post('/contact', userController.contact)
export default router