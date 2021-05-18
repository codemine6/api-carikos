import mongoose from 'mongoose'
import {UploadImage} from '../utils/cloudinary.js'

const roomSchema = mongoose.Schema({
    availableRooms: {
        type: Number,
        default: 0
    },
    customerType: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: [true, 'Silahkan tambahkan deskripsi']
    },
    facilities: {
        type: [Object],
        validate: [value => value.length > 0, 'Silahkan tambahkan fasilitas']
    },
    images: {
        type: [String],
        validate: [value => value.length > 0, 'Silahkan tambahkan foto']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Silhakan tambahkan alamat']
        },
        city: {
            type: String,
            required: [true, 'Silahkan tambahkan kota']
        },
        coords: [Number]
    },
    name: {
        type: String,
        required: [true, 'Silahakan masukan nama kost']
    },
    owner: {
        type: String,
        ref: 'User'
    },
    pricing: {
        price: {
            type: Number,
            validate: [value => value > 0, 'Silahkan tambahkan harga sewa']
        },
        type: {
            type: String
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false})

roomSchema.pre('save', async function(next) {
    try {
        const images = await Promise.all(this.images.map(async img => await UploadImage(img, 'room_image')))
        this.images = images
        next()
    } catch {
        next(new Error)
    }
})

roomSchema.pre('findOneAndUpdate', async function(next) {
    try {
        if (this._update.images) {
            const images = await Promise.all(this._update.images.filter(img => !img.includes('https')).map(img => UploadImage(img, 'room_image')))
                .then(data => [...data, ...this._update.images.filter(img => img.includes('https'))])
            this._update.images = images
        }
        next()
    } catch {
        next(new Error)
    }
})

roomSchema.post('save', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0].message
        next(new Error(message))
    } else next()
})

roomSchema.post('findOneAndUpdate', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0].message
        next(new Error(message))
    } else next()
})

export default mongoose.model('Room', roomSchema)