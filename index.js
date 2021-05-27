import express from 'express'
import mongoose from 'mongoose'
import {createServer} from 'http'
import {Server} from 'socket.io'

import cors from './middleware/cors.js'
import {ChatHandler} from './sockets/chat.js'
import {DashboardHandler} from './sockets/dashboard.js'
import {MessageHandler} from './sockets/message.js'
import {NotificationHandler} from './sockets/notification.js'
import config from './utils/config.js'
import './utils/schedule.js'

import auth from './routes/auth.js'
import booking from './routes/booking.js'
import chat from './routes/chat.js'
import message from './routes/message.js'
import notification from './routes/notification.js'
import promo from './routes/promo.js'
import review from './routes/review.js'
import room from './routes/room.js'
import user from './routes/user.js'

const app = express()
const http = createServer(app)
const io = new Server(http, {cors: {origin: config.origin}})

app.use(express.json({limit: '50mb'}))
app.use(cors)

app.use('/auth', auth)
app.use(booking)
app.use(chat)
app.use(message)
app.use(notification)
app.use(promo)
app.use(review)
app.use(room)
app.use(user)

mongoose.connect(config.db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => {
    http.listen(config.port, () => {
        io.of('/chat').on('connect', socket => ChatHandler(socket))
        io.of('/dashboard').on('connect', socket => DashboardHandler(socket))
        io.of('/message').on('connect', socket => MessageHandler(socket))
        io.of('/notification').on('connect', socket => NotificationHandler(socket))
        console.log('App running..')
    })
}).catch(err => console.log(err))