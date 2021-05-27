import jwt from 'jsonwebtoken'
import config from '../utils/config.js'

export const authRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.access

        if (!token) throw new EvalError

        const credentials = jwt.verify(token, config.access_key)
        req.user = credentials
        next()
    } catch (err) {
        err instanceof EvalError ? res.status(403).json({...err}) : res.sendStatus(401)
    }
}

export const ownerRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.access

        if (!token) throw new EvalError

        const credentials = jwt.verify(token, config.access_key)
        if (credentials && credentials.type === 'owner') {
            req.user = credentials
            next()
        } else throw new EvalError
    } catch (err) {
        err instanceof EvalError ? res.sendStatus(403) : res.sendStatus(401)
    }
}

export const customerRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.access

        if (!token) throw new EvalError

        const credentials = jwt.verify(token, config.access_key)
        if (credentials.type === 'customer') {
            req.user = credentials
            next()
        } else throw new EvalError
    } catch (err) {
        err instanceof EvalError ? res.sendStatus(403) : res.sendStatus(401)
    }
}