import Promo from '../models/Promo.js'

export const promo = async (req, res) => {
    try {
        const promos = await Promo.find().lean()
        res.status(200).json({data: promos})
    } catch {
        res.sendStatus(404)
    }
}