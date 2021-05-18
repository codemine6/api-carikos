import Review from '../models/Review.js'
import Booking from '../models/Booking.js'

export const addReview = async (req, res) => {
    try {
        const exist = await Review.exists({booking: req.body.booking, customer: req.user._id})
        if (exist) {
            await Review.findOneAndUpdate({booking: req.body.booking, customer: req.user._id}, {
                booking: req.body.booking,
                customer: req.user._id,
                images: req.body.images,
                message: req.body.message,
                owner: req.body.owner,
                rating: req.body.rating,
                room: req.body.room
            })
        } else {
            await Review.create({
                booking: req.body.booking,
                customer: req.user._id,
                images: req.body.images,
                message: req.body.message,
                owner: req.body.owner,
                rating: req.body.rating,
                room: req.body.room
            })
        }
        res.sendStatus(200)
    } catch {
        res.sendStatus(400)
    }
}

export const replyReview = async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, {
            reply: {
                message: req.body.message,
                createdAt: Date.now()
            }
        })
        res.sendStatus(200)
    } catch {
        res.sendStatus(400)
    }
}

export const getReviews = async (req, res) => {
    try {
        const reply = req.query.type === 'replied' ? {$ne: null} : null
        const reviews = await Review.find({reply}).lean()
            .select('message createdAt rating reply')
            .populate('room', '-_id images location.city name')
            .populate('customer', '-_id username')

        const data = reviews.map(review => {
            const images = review.room.images.slice(0,1)
            return {...review, room: {...review.room, images: images}}
        })
        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const getReview = async (req, res) => {
    try {
        const review = await Review.findOne({booking: req.params.booking, customer: req.user._id}).lean()
            .select('-_id images message rating')
        const booking = await Booking.findById(req.params.booking).lean()
            .select('-_id room')
            .populate('room', 'availableRooms images location.city name owner')

        const room = booking.room
        room.images = room.images.slice(0,1)
        res.status(200).json({data: {...review, room}})
    } catch {
        resizeBy.sendStatus(404)
    }
}

export const roomReviews = async (req, res) => {
    try {
        const reviews = await Review.find({room: req.params.room}).lean()
            .select('-_id createdAt message rating reply')
            .populate('customer', '-_id username')

        res.status(200).json({data: reviews})
    } catch {
        res.sendStatus(404)
    }
}