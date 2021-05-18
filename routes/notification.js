import express from 'express'
import {notificationList, notificationReaded} from '../controllers/notification.js'
import {authRoute} from '../middleware/auth.js'

const router = express.Router()

router.patch('/notifications/:id', authRoute, notificationReaded)
router.get('/notifications', authRoute, notificationList)

export default router