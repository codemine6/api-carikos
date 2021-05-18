import cloudinary from 'cloudinary'
import config from './config.js'

cloudinary.v2.config({
    cloud_name: config.cloud_name,
    api_key: config.cloud_api_key,
    api_secret: config.cloud_api_secret
})

export async function UploadImage(image, preset) {
    const res = await cloudinary.v2.uploader.upload(image, {upload_preset: preset})
    return `https://res.cloudinary.com/carikos/image/upload/${res.public_id}.${res.format}`
}

export default cloudinary