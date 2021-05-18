import express from 'express'
import {newBooking, confirm, finish, cancel, allBookings, roomBookings, bookingDetails} from '../controllers/booking.js'
import {authRoute, customerRoute, ownerRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/bookings', customerRoute, newBooking)
router.patch('/bookings/:id/confirm', ownerRoute, confirm)
router.patch('/bookings/:id/finish', ownerRoute, finish)
router.patch('/bookings/:id/cancel', authRoute, cancel)
router.get('/bookings', authRoute, allBookings)
router.get('/bookings/:room/room', ownerRoute, roomBookings)
router.get('/bookings/:id', authRoute, bookingDetails)

export default router