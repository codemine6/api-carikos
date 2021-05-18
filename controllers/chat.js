import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

export const startChat = async (req, res) => {
    try {
        const users = [req.user._id, req.body.user]
        const chat = await Chat.findOne({users}).lean().select('_id')
        if (chat) {
            res.status(200).json({data: {_id: chat._id}})
        } else {
            const chat = await Chat.create({users})
            res.status(200).json({data: {_id: chat._id}})
        }
    } catch {
        res.sendStatus(403)
    }
}

export const deleteChat = async (req, res) => {
    try {
        const messages = await Message.find({chat: req.params.id, deleteFor: {$ne: req.user._id}}).lean().select('deleteFor')
        messages.map(async message => {
            if (message.deleteFor) {
                await Message.findByIdAndDelete(message._id)
            } else {
                await Message.findByIdAndUpdate(message._id, {deleteFor: req.user._id})
            }
        })
        res.sendStatus(200)
    } catch {
        res.sendStatus(404)
    }
}