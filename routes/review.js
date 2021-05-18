import express from 'express'
import {addReview, replyReview, getReviews, getReview, roomReviews} from '../controllers/review.js'
import {ownerRoute, customerRoute} from '../middleware/auth.js'

const router = express.Router()

router.patch('/reviews/add', customerRoute, addReview)
router.patch('/reviews/:id/reply', ownerRoute, replyReview)
router.get('/reviews', ownerRoute, getReviews)
router.get('/reviews/:booking', customerRoute, getReview)
router.get('/reviews/:room/room', roomReviews)

export default router