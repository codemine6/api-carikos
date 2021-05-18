import mongoose from 'mongoose'

const bookingSchema = mongoose.Schema({
    bookedAt: {
        type: Date,
        default: Date.now
    },
    canceledAt: {
        type: Date,
        default: null
    },
    confirmedAt: {
        type: Date,
        default: null
    },
    finishedAt: {
        type: Date,
        default: null
    },
    customer: {
        type: String,
        ref: 'User'
    },
    details: {
        code: {
            type: String
        },
        time: {
            type: String
        },
        type: {
            type: String
        }
    },
    owner: {
        type: String,
        ref: 'User'
    },
    payment: {
        total: {
            type: Number
        },
        type: {
            type: String
        }
    },
    room: {
        type: String,
        ref: 'Room'
    },
    status: {
        type: String,
        default: 'waiting'
    }
}, {versionKey: false})

export default mongoose.model('Booking', bookingSchema)