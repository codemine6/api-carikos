import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {sendVerification} from '../utils/emailActions.js'
import {generateAccessToken, generateRefreshToken} from '../utils/generateToken.js'
import config from '../utils/config.js'

export const login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email}).lean()
            .select('email emailVerified password profileImage type username')
        const matching = bcrypt.compareSync(req.body.password, user.password)
        if (matching && user.emailVerified) {
            const access = generateAccessToken(user)
            const refresh = await generateRefreshToken(user)
            res.status(200).json({data: {
                _id: user._id,
                email: user.email,
                profileImage: user.profileImage,
                type: user.type,
                username: user.username,
                token: {access, refresh}
            }})
        } else if (matching) {
            const token = await generateRefreshToken(user)
            await sendVerification({...user, token})
            res.sendStatus(202)
        } else throw new Error
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Email atau password salah'})
    }
}

export const register = async (req, res) => {
    try {
        const user = await User.create(req.body)
        const token = await generateRefreshToken(user)
        await sendVerification({...user._doc, token})
        res.sendStatus(201)
    } catch {
        res.status(400).json({message: err.message})
    }
}

export const token = async (req, res) => {
    try {
        const token = req.body.refresh
        const exist = await User.exists({token})
        if (exist) {
            const user = jwt.verify(token, config.refresh_key)
            const access = generateAccessToken(user)
            const refresh = await generateRefreshToken(user)
            res.status(201).json({data: {
                token: {access, refresh}
            }})
        } else throw new Error
    } catch {
        res.sendStatus(403)
    }
}

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {token: null})
        res.sendStatus(200)
    } catch {
        res.sendStatus(404)
    }
}

export const status = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean()
            .select('email profileImage type username')
        res.status(200).json({data: user})
    } catch (err) {
        res.sendStatus(404)
    }
}