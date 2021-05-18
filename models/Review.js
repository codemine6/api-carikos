import mongoose from 'mongoose'

const replySchema = mongoose.Schema({
    _id: false,
    message: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

const reviewSchema = mongoose.Schema({
    booking: {
        type: String,
        ref: 'Booking'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    customer: {
        type: String,
        ref: 'User'
    },
    images: [{
        type: String
    }],
    message: {
        type: String
    },
    owner: {
        type: String,
        ref: 'User'
    },
    rating: {
        type: Number
    },
    reply: {
        type: replySchema,
        default: null
    },
    room: {
        type: String,
        ref: 'Room'
    }
}, {versionKey: false})

export default mongoose.model('Review', reviewSchema)