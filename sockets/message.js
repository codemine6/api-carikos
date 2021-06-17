import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

export function MessageHandler(socket) {
    socket.on('messages', async params => {
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