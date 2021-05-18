import mongoose from 'mongoose'

const chatSchema = mongoose.Schema({
    startedAt: {
        type: Date,
        default: Date.now
    },
    users: [{
        type: String,
        ref: 'User'
    }]
}, {versionKey: false})

export default mongoose.model('Chat', chatSchema)