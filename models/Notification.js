import mongoose from 'mongoose'

const notificationSchema = mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    link: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    text: {
        type: String
    },
    title: {
        type: String
    },
    user: {
        type: String
    }
}, {versionKey: false})

export default mongoose.model('Notification', notificationSchema)