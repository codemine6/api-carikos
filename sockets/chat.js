import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

export function ChatHandler(socket) {
    socket.on('count', async (user, callback) => {
        async function countChat() {
            const chats = await Chat.find({users: user}).lean()
            return await Promise.all(chats.map(async chat => {
                return Message.findOne({chat: chat._id, read: false, receiver: user}).lean().sort({sendedAt: 'desc'})
            })).then(data => data.filter(item => item).length)
        }

        callback(await countChat())

        Message.watch().on('change', async changes => {
            if (changes.operationType === 'insert' && changes.fullDocument.receiver === user) {
                socket.emit('new_count', await countChat())
            }
        })
    })

    socket.on('all', async (user, callback) => {
        const chats = await Chat.find({users: user}).lean().select('-startedAt')
            .populate({
                path: 'users',
                match: {_id: {$ne: user}},
                select: '-_id username profileImage'
            })
        const data = await Promise.all(chats.map(async chat => {
            const lastMessage = await Message.findOne({chat: chat._id, deleteFor: {$ne: user}}).lean().sort({sendedAt: 'desc'})
                .select('-_id sendedAt text')
            const newMessage = await Message.find({chat: chat._id, read: false, receiver: user}).countDocuments()
            return {_id: chat._id, user: chat.users[0], lastMessage, newMessage}
        })).then(data => {
            const result = data.filter(item => item.lastMessage)
            result.sort((a, b) => new Date(b.lastMessage.sendedAt) - new Date(a.lastMessage.sendedAt))
            return result
        })
        callback(data)

        Message.watch().on('change', async changes => {
            if (changes.operationType === 'insert' && changes.fullDocument.receiver === user) {
                const lastMessage = changes.fullDocument
                const newMessage = await Message.find({chat: lastMessage.chat, read: false, receiver: user}).countDocuments()
                const otherUser = await User.findById(lastMessage.sender).lean()
                    .select('-_id username profileImage')
                socket.emit('new_chat', {
                    _id: lastMessage.chat,
                    lastMessage: {
                        sendedAt: lastMessage.sendedAt,
                        text: lastMessage.text
                    },
                    newMessage,
                    user: otherUser
                })
            }
        })
    })
}