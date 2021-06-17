import express from 'express'
import {startChat, deleteChat, getAllChats, getOneChat} from '../controllers/chat.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/chats/start', authRoute, startChat)
router.delete('/chats/:id/delete', authRoute, deleteChat)
router.get('/chats', authRoute, getAllChats)
router.get('/chats/:id', authRoute, getOneChat)

export default router