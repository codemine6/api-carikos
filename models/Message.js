import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    chat: {
        type: String
    },
    deleteFor: {
        type: String,
        default: null
    },
    images: [{
        type: String
    }],
    read: {
        type: Boolean,
        default: false
    },
    receiver: {
        type: String
    },
    room: {
        type: String,
        default: null
    },
    sender: {
        type: String
    },
    sendedAt: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String
    }
}, {versionKey: false})

export default mongoose.model('Message', messageSchema)