import Notification from '../models/Notification.js'

export const notificationReaded = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {read: true})
        res.sendStatus(200)
    } catch {
        res.sendStatus(404)
    }
}

export const notificationList = async (req, res) => {
    try {
        const notifications = await Notification.find({user: req.user._id}).lean().sort({createdAt: 'desc'}).select('-user')
        res.status(200).json({data: notifications})
    } catch {
        res.sendStatus(404)
    }
}