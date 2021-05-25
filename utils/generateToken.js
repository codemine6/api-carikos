import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import config from './config.js'

export function generateAccessToken({_id, type}) {
    return jwt.sign({_id, type}, config.access_key, {expiresIn: '30s'})
}

export async function generateRefreshToken({_id, type}) {
    const token = jwt.sign({_id, type}, config.refresh_key)
    await User.findByIdAndUpdate(_id, {token})
    return token
}