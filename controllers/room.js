import Room from '../models/Room.js'
import User from '../models/User.js'
import Review from '../models/Review.js'
import Booking from '../models/Booking.js'

export const addRoom = async (req, res) => {
    try {
        await Room.create({...req.body, owner: req.user._id})
        res.sendStatus(201)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
}

export const updateRoom = async (req, res) => {
    try {
        await Room.findByIdAndUpdate(req.params.id, {
            ...req.body,
            updatedAt: Date.now()
        }, {runValidators: true})
        res.sendStatus(201)
    } catch (err) {
        res.status(404).json({message: err.message})
    }
}

export const addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean().select('-_id roomFavorites')
        const favorited = user.roomFavorites.includes(req.body.room)
        if (favorited) {
            const data = user.roomFavorites.filter(id => id !== req.body.room)
            const newUser = await User.findByIdAndUpdate(req.user._id, {
                roomFavorites: data
            }, {new: true})
            res.sendStatus(204)
        } else {
            const data = [...user.roomFavorites, req.body.room]
            const newUser = await User.findByIdAndUpdate(req.user._id, {
                roomFavorites: data
            }, {new: true})
            res.sendStatus(201)
        }
    } catch {
        res.sendStatus(400)
    }
}

export const searchRooms = async (req, res) => {
    try {
        const query = new RegExp(req.query.query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi')
        const rooms = await Room.find({'name': query}).lean()
            .select('customerType images location.city name pricing')
            .slice('images', 1)
        if (rooms) {
            const data = await Promise.all(rooms.map(async room => {
                const ratings = await Review.find({room: room._id}).lean().select('-_id rating')
                const rating = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length || 0
                return {...room, rating}
            }))
            res.status(200).json({data})
        } else throw new Error
    } catch {
        res.sendStatus(404)
    }
}

export const getMyRooms = async (req, res) => {
    try {
        const rooms = await Room.find({owner: req.user._id}).lean().sort({createdAt: 'desc'})
            .select('images location.address location.city name pricing').slice('images', 1)

        const data = await Promise.all(rooms.map(async room => {
            const bookings = await Booking.find({room: room._id, status: 'finished'}).countDocuments()
            const reviews = await Review.find({room: room._id}).lean().select('-_id rating')
            const rating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length || 0
            return {...room, bookings, rating, reviews: reviews.length}
        }))
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const getPopular = async (req, res) => {
    try {
        const rooms = await Room.find().lean()
            .select('customerType images location.city location.address name pricing')
            .slice('images', 1)
        const data = await Promise.all(rooms.map(async room => {
            const ratings = await Review.find({room: room._id}).lean().select('-_id rating')
            const rating = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length || 0
            return {...room, rating}
        }))
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean()
            .select('-_id roomFavorites')
            .populate('roomFavorites', 'customerType location.city images name pricing')
        const rooms = user.roomFavorites.map(room => ({...room, images: room.images.slice(0,1)}))
        res.status(200).json({data: rooms})
    } catch {
        res.sendStatus(404)
    }
}

export const getNearest = async (req, res) => {
    try {
        const rooms = await Room.find().lean()
            .select('images location.address location.coords name pricing')
            .slice('images', 1)
        res.status(200).json({data: rooms})
    } catch {
        res.sendStatus(404)
    }
}

export const getOneRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).lean()
            .select('-_id -createdAt -updatedAt -owner')
        res.status(200).json({data: room})
    } catch {
        res.sendStatus(404)
    }
}

export const roomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).lean()
            .select('-createdAt')
            .populate('owner', ['username', 'profileImage', 'type'])
        const ratings = await Review.find({room: room._id}).lean().select('-_id rating')
        const rating = ratings.reduce((a, b) => a + b.rating, 0) / ratings.length || 0
        const review = await Review.findOne({room: room._id}).lean()
            .select('-_id customer rating text')
            .populate('customer', '-_id username')
        const data = {
            ...room,
            _id: room._id,
            rating,
            reviewCount: ratings.length,
            review,
        }
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}