import express from 'express'
import {startChat, deleteChat} from '../controllers/chat.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/chats/start', authRoute, startChat)
router.delete('/chats/:id/delete', authRoute, deleteChat)

export default router