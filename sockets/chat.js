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

    socket.on('all', async user => {
        Message.watch().on('change', async changes => {
            if (changes.operationType === 'insert' && changes.fullDocument.receiver === user) {
                const lastMessage = changes.fullDocument
                const newMessage = await Message.find({chat: lastMessage.chat, read: false, receiver: user}).countDocuments()
                const otherUser = await User.findById(lastMessage.sender).lean()
                    .select('-_id username profileImage')
                socket.emit('new_chat', {
                    _id: lastMessage.chat,
                    lastMessage: {
                        read: lastMessage.read,
                        sendedAt: lastMessage.sendedAt,
                        sender: lastMessage.sender,
                        text: lastMessage.text
                    },
                    newMessage,
                    user: otherUser
                })
            }
        })
    })
}