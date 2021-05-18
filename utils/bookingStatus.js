import Booking from '../models/Booking.js'
import Notification from '../models/Notification.js'

export async function bookingStatus(booking) {
    const past = booking.bookedAt.getTime() + 259200000
    if (booking.status === 'waiting' && past < Date.now()) {
        const result = await Booking.findByIdAndUpdate(booking._id, {
            canceledAt: Date.now(),
            status: 'canceled'
        }, {new: true})

        await Notification.create({
            link: `/bookings/${result._id}`,
            text: 'Waktu tunggu pesanan telah habis.',
            title: 'Pesanan dibatalkan',
            user: result.customer._id
        })
        await Notification.create({
            link: `/bookings/${result._id}`,
            text: 'Waktu tunggu pesanan telah habis.',
            title: 'Pesanan dibatalkan',
            user: result.owner
        })

        booking.status = result.status
        booking.canceledAt = result.canceledAt
        return booking
    } else return booking
}