import express from 'express'
import {verifyEmail, forgotPassword, resetPassword, updateUser, setPassword, getDetails} from '../controllers/user.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password', resetPassword)
router.patch('/users', authRoute, updateUser)
router.patch('/set-password', authRoute, setPassword)
router.get('/users/:id', authRoute, getDetails)

export default router