import schedule from 'node-schedule'
import Room from '../models/Room.js'
import User from '../models/User.js'
import cloudinary from './cloudinary.js'

async function removeRoomImage() {
    try {
        const roomImages = await Room.find().lean().select('-_id images')
        const images = roomImages.map(data => data.images).flat(1)
        const cloud = await cloudinary.v2.api.resources({type: 'upload', prefix: 'room', max_results: 999999999999999})
        cloud.resources.map(item => {
            const url = `https://res.cloudinary.com/carikos/image/upload/${item.public_id}.${item.format}`
            if (!images.some(img => img === url)) {
                cloudinary.v2.uploader.destroy(item.public_id)
            }
        })
    } catch (err) {
        console.log(err)
    }
}

async function removeUserImage() {
    try {
        const userImages = await User.find().lean().select('-_id profileImage')
        const images = userImages.map(data => data.profileImage)
        const cloud = await cloudinary.v2.api.resources({type: 'upload', prefix: 'user', max_results: 999999999999999})
        cloud.resources.map(item => {
            const url = `https://res.cloudinary.com/carikos/image/upload/${item.public_id}.${item.format}`
            if(!images.some(img => img === url)) {
                cloudinary.v2.uploader.destroy(item.public_id)
            }
        })
    } catch (err) {
        console.log(err)
    }
}

schedule.scheduleJob('59 59 23 * * *', () => {
    removeRoomImage()
    removeUserImage()
})