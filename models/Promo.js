import mongoose from 'mongoose'

const promoSchema = mongoose.Schema({
    image: {
        type: String
    }
}, {versionKey: false})

export default mongoose.model('Promo', promoSchema)