import express from 'express'
import {login, register, token, logout, status} from '../controllers/auth.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/token', token)
router.get('/logout', authRoute, logout)
router.get('/status', authRoute, status)

export default router