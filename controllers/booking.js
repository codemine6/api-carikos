import Booking from '../models/Booking.js'
import Room from '../models/Room.js'
import Notification from '../models/Notification.js'
import {bookingStatus} from '../utils/bookingStatus.js'

export const newBooking = async (req, res) => {
    try {
        const room = await Room.findById(req.body.room).lean().select('-_id availableRooms')
        if (room.availableRooms > 0) {
            const booking = await Booking.create(req.body)
            if (booking) {
                await Notification.create({
                    link: `/bookings/${booking._id}`,
                    text: 'Ada pesanan baru nih',
                    title: 'Pesanan baru',
                    user: req.body.owner
                })
                res.status(200).json({data: {_id: booking._id}})
            } else throw new Error('Pesanan tidak dapat diproses')
        } else throw new Error('Tidak ada ruangan yang tersedia')
    } catch (err) {
        res.status(403).json({message: err.message})
    }
}

export const confirm = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean().select('-_id room status')
            .populate('room', 'availableRooms')
        if (booking.room.availableRooms > 0 && booking.status === 'waiting') {
            await Room.findByIdAndUpdate(booking.room._id, {availableRooms: booking.room.availableRooms - 1})
            const result = await Booking.findByIdAndUpdate(req.params.id, {
                confirmedAt: Date.now(),
                status: 'confirmed'
            }, {new: true})
            if (result) {
                await Notification.create({
                    link: `/bookings/${result._id}`,
                    text: 'Pesananmu telah dikonfirmasi. Segera lakukan pembayaran.',
                    title: 'Konfirmasi pesanan',
                    user: result.customer
                })
                res.status(200).json({data: {confirmedAt: result.confirmedAt, status: result.status}})
            } else throw Error('Gagal mengkonfirmasi pensanan')
        } else throw new Error('Tidak ada ruangan yang tersedia')
    } catch (err) {
        res.status(400).json({message: err.message})
    }
}

export const finish = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, {
            finishedAt: Date.now(),
            status: 'finished'
        }, {new: true})
        if (booking) {
            await Notification.create({
                link: `/bookings/${booking._id}`,
                text: 'Pesananmu telah selesai. Terima kasih telah melakukan pemesanan.',
                title: 'Pesanan selesai',
                user: booking.customer
            })
            res.status(200).json({data: {finishedAt: booking.finishedAt, status: booking.status}})
        } else throw new Error('Pesanan tidak dapat diselesaikan')
    } catch (err) {
        res.status(400).json({message: err.message})
    }
}

export const cancel = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean().select('-_id room status').populate('room', 'availableRooms')
        const result = await Booking.findByIdAndUpdate(req.params.id, {
            canceledAt: Date.now(),
            status: 'canceled'
        }, {new: true})
        if (result && booking.status === 'waiting') {
            await Notification.create({
                link: `/bookings/${result._id}`,
                text: 'Pesanan telah dibatalkan oleh pemesan.',
                title: 'Pesanan dibatalkan',
                user: result.owner
            })
            res.status(200).json({data: {canceledAt: result.canceledAt, status: result.status}})
        } else if (result && booking.status === 'confirmed') {
            await Room.findByIdAndUpdate(booking.room._id, {availableRooms: booking.room.availableRooms + 1})
            await Notification.create({
                link: `/bookings/${result._id}`,
                text: 'Pesananmu dibatalkan oleh pemilik.',
                title: 'Pesanan dibatalkan',
                user: result.customer
            })
            res.status(200).json({canceledAt: result.canceledAt, status: result.status})
        } else throw new Error
    } catch {
        res.status(400).json({message: 'Pesanan tidak dapat dibatalkan'})
    }
}

export const allBookings = async (req, res) => {
    try {
        const status = req.query.status === 'all' ? {$ne: null} : req.query.status
        const user = req.user.type === 'owner' ? {owner: req.user._id} : {customer: req.user._id}
        const bookings = await Booking.find({status, ...user}).sort({bookedAt: 'desc'}).lean()
            .select('bookedAt payment.total status')
            .populate('customer', '-_id username')
            .populate('room', '-_id images location.address location.city name')

        const data = await Promise.all(bookings.map(async booking => await bookingStatus(booking)))
            .then(data => data.filter(booking => req.query.status === 'all' ? true : (booking.status === req.query.status)))
            .then(data => data.map(booking => {
                const images = booking.room.images.slice(0,1)
                return {...booking, room: {...booking.room, images}}
            }))
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const roomBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({room: req.params.room, status: 'finished'}).sort({bookedAt: 'desc'}).lean()
            .select('bookedAt payment.total status')
            .populate('customer', '-_id username')
            .populate('room', '-_id images location.address location.city name')

        const data = bookings.map(booking => {
            const images = booking.room.images.slice(0,1)
            return {...booking, room: {...booking.room, images}}
        })
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const bookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean()
            .populate('room', 'availableRooms images location.city name')
            .populate('owner', 'profileImage username')
            .populate('customer', 'profileImage username')

        const data = await bookingStatus(booking)
        data.room.images = booking.room.images.slice(0,1)
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}