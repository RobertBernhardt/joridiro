import express from 'express'
import paymentController from '../controllers/payment.controller'
import { authGuard } from '../utils/guards/authGuard'

const router = express.Router()

router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => paymentController.webhook(req, res))
router.post('/:id', (req, res) => paymentController.payment(req, res))


export default router