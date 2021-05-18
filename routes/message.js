import express from 'express'
import {addMessage} from '../controllers/message.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/messages', authRoute, addMessage)

export default router