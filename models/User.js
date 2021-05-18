import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import {UploadImage} from '../utils/cloudinary.js'

const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordPattern = /[a-z\d]{6,20}$/i
const phonePattern = /^(\+?62|0)8\d{7,11}$/
const usernamePattern = /^[a-z]{2,10} ?[a-z]{2,10}$/i

const userSchema = mongoose.Schema({
    city: {
        type: String,
        default: null
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'Silahkan masukan alamat email'],
        validate: [email => emailPattern.test(email), 'Alamat Email tidak valid']
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: [true, 'Silahkan masukan password'],
        validate: [password => passwordPattern.test(password), 'Password tidak valid']
    },
    phone: {
        type: String,
        required: [true, 'Silahkan masukan nomor telepon'],
        validate: [phone => phonePattern.test(phone), 'Nomor telepon tidak valid']
    },
    profileImage: {
        type: String,
        default: 'https://placeimg.com/100/100/people'
    },
    registerAt: {
        type: Date,
        default: Date.now
    },
    roomFavorites: [{
        type: String,
        ref: 'Room'
    }],
    token: {
        type: String,
        default: null
    },
    type: {
        type: String,
        required: [true, 'Silahkan pilih tipe pengguna']
    },
    username: {
        type: String,
        required: [true, 'Silahkan masukan nama pengguna'],
        validate: [username => usernamePattern.test(username), 'Nama pengguna tidak valid']
    }
}, {versionKey: false})

userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

userSchema.pre('findOneAndUpdate', async function(next) {
    try {
        if (this._update.profileImage && !this._update.profileImage.includes('https')) {
            this._update.profileImage = await UploadImage(this._update.profileImage, 'user_image')
        }
        if (this._update.password) {
            this._update.password = bcrypt.hashSync(this._update.password, 10)
        }
        next()
    } catch {
        next(new Error)
    }
})

userSchema.post('save', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0].message
        next(new Error(message))
    } else if (error.code === 11000) {
        next(new Error('Email sudah terdaftar'))
    } else next()
})

userSchema.post('findOneAndUpdate', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)[0].message
        next(new Error(message))
    } else next()
})

export default mongoose.model('User', userSchema)