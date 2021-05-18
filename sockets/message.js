import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

export function MessageHandler(socket) {
    socket.on('messages', async (params, callback) => {
        const chat = await Chat.findById(params.chat).lean().select('-_id -startedAt')
            .populate({
                path: 'users',
                match: {_id: {$ne: params.user}},
                select: 'username profileImage'
            })
        const messages = await Message.find({chat: params.chat, deleteFor: {$ne: params.user}}).lean()
        messages.map(async message => {
            if (message.sender !== params.user && !message.read) {
                await Message.findByIdAndUpdate(message._id, {read: true})
            }
        })
        callback({user: chat.users[0], messages})

        Message.watch().on('change', async changes => {
            if (
                changes.operationType === 'insert' &&
                changes.fullDocument.chat === params.chat &&
                changes.fullDocument.receiver === params.user
            ) {
                const message = changes.fullDocument
                socket.emit('new_message', message)
            } else if (changes.operationType === 'update' && changes.updateDescription.updatedFields.read) {
                const {sender} = await Message.findById(changes.documentKey._id).lean().select('-_id sender')
                if (sender === params.user) {
                    socket.emit('readed', changes.documentKey._id)
                }
            }
        })
    })

    socket.on('read', async message => {
        await Message.findByIdAndUpdate(message, {read: true})
    })
}