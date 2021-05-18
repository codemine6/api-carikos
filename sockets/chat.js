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
            const message = await Message.findOne({chat: chat._id, deleteFor: {$ne: user}}).lean().sort({sendedAt: 'desc'})
            return {_id: chat._id, user: chat.users[0], message}
        })).then(data => data.filter(item => item.message).sort((a, b) => new Date(b.message.sendedAt) - new Date(a.message.sendedAt)))
        callback(data)

        Message.watch().on('change', async changes => {
            if (changes.operationType === 'insert' && changes.fullDocument.receiver === user) {
                const message = changes.fullDocument
                const user = await User.findById(message.sender).lean()
                socket.emit('new_chat', {
                    _id: message.chat,
                    message,
                    user: {
                        profileImage: user.profileImage,
                        username: user.username
                    }
                })
            }
        })
    })
}