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

export const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({users: req.user._id}).lean().select('-startedAt')
            .populate({
                path: 'users',
                match: {_id: {$ne: req.user._id}},
                select: '-_id username profileImage'
            })
        const data = await Promise.all(chats.map(async chat => {
            const lastMessage = await Message.findOne({chat: chat._id, deleteFor: {$ne: req.user._id}}).lean().sort({sendedAt: 'desc'})
                .select('-_id read sendedAt sender text')
            const newMessage = await Message.find({chat: chat._id, read: false, receiver: req.user._id}).countDocuments()
            return {_id: chat._id, user: chat.users[0], lastMessage, newMessage}
        })).then(data => {
            const result = data.filter(item => item.lastMessage)
            result.sort((a, b) => new Date(b.lastMessage.sendedAt) - new Date(a.lastMessage.sendedAt))
            return result
        })

        res.status(200).json({data})
    } catch {
        res.sendStatus(404)
    }
}

export const getOneChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id).lean().select('-_id -startedAt')
            .populate({
                path: 'users',
                match: {_id: {$ne: req.user._id}},
                select: 'username profileImage'
            })
        const messages = await Message.find({chat: req.params.id, deleteFor: {$ne: req.user._id}}).lean()
            .select('read sendedAt sender text')
        messages.map(async message => {
            if (message.sender !== req.user._id && !message.read) {
                await Message.findByIdAndUpdate(message._id, {read: true})
            }
        })

        res.status(200).json({data: {user: chat.users[0], messages}})
    } catch {
        res.sendStatus(404)
    }
}