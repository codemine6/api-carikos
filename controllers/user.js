import bcrypt from 'bcrypt'
import User from '../models/User.js'
import {sendResetPassword} from '../utils/emailActions.js'
import {generateAccessToken, generateRefreshToken} from '../utils/generateToken.js'

export const verifyEmail = async (req, res) => {
    try {
        const exist = await User.exists({_id: req.body.id, token: req.body.token})
        if (!exist) throw new Error

        const user = await User.findByIdAndUpdate(req.body.id, {emailVerified: true}, {new: true})
        const accessToken = generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)
        res.status(200).json({data: {
            accessToken,
            refreshToken,
            _id: user._id,
            email: user.email,
            profileImage: user.profileImage,
            type: user.type,
            username: user.username
        }})
    } catch {
        res.sendStatus(403)
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email}).lean().select('email type username')
        const token = await generateRefreshToken(user)
        await sendResetPassword({...user, token})
        res.sendStatus(200)
    } catch {
        res.sendStatus(404)
    }
}

export const resetPassword = async (req, res) => {
    try {
        const exist = await User.exists({_id: req.body.id, token: req.body.token})
        if (!exist) throw new Error
        if (!req.body.newPassword || !/[a-z\d]{6,20}$/i.test(req.body.newPassword)) throw new Error('Password tidak valid')

        await User.findByIdAndUpdate(req.body.id, {password: req.body.newPassword}, {runValidators: true})
        res.sendStatus(201)
    } catch (err) {
        res.status(403).json({message: err.message})
    }
}

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, {...req.body}, {runValidators: true, new: true})
        res.status(201).json({data: {
            profileImage: user.profileImage,
            username: user.username
        }})
    } catch (err) {
        res.status(400).json({message: err.message})
    }
}

export const setPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean().select('-_id password')
        const matching = bcrypt.compareSync(req.body.oldPassword, user.password)

        if (!matching) throw new Error('Password sebelumnya salah')
        if (!req.body.newPassword || !/[a-z\d]{6,20}$/i.test(req.body.newPassword)) throw new Error('Password tidak valid')

        await User.findByIdAndUpdate(req.user._id, {password: req.body.newPassword}, {runValidators: true})
        res.sendStatus(201)
    } catch (err) {
        res.status(403).json({message: err.message})
    }
}

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean()
        console.log(req.user)
        res.status(200).json({data: user})
    } catch {
        res.sendStatus(404)
    }
}