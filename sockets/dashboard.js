import Booking from '../models/Booking.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import Review from '../models/Review.js'
import Room from '../models/Room.js'

export function DashboardHandler(socket) {
    socket.on('get', async (user, callback) => {
        const bookings = await Booking.find({owner: user}).lean().countDocuments()
        const chats = await Chat.find({users: user})
        const messages = await Promise.all(chats.map(async chat => {
            return Message.findOne({chat: chat._id, read: false, receiver: user}).lean()
        })).then(data => data.filter(item => item).length)
        const rooms = await Room.find({owner: user}).lean()
        const reviews = await Promise.all(rooms.map(async room => {
            return Review.find({room: room._id}).lean()
        })).then(data => data.flat().length)

        callback({bookings, messages, reviews, rooms: rooms.length})
    })
}