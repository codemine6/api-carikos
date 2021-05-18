import Notification from '../models/Notification.js'

export function NotificationHandler(socket) {
    socket.on('count', async (user, callback) => {
        const count = await Notification.find({user, read: false}).countDocuments()
        callback(count)

        Notification.watch().on('change', async changes => {
            if (changes.operationType === 'insert' && changes.fullDocument.user === user) {
                const count = await Notification.find({user, read: false}).countDocuments()
                socket.emit('new_count', count)
            }
        })
    })
}