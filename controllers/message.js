import Message from '../models/Message.js'

export const addMessage = async (req, res) => {
    try {
        const message = await Message.create(req.body)
        res.status(200).json({data: message})
    } catch {
        res.sendStatus(400)
    }
}