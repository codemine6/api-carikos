import dotenv from 'dotenv'
dotenv.config()

const config = {
    cloud_api_key: process.env.CLOUD_API_KEY,
    cloud_api_secret: process.env.CLOUD_API_SECRET,
    cloud_name: process.env.CLOUD_NAME,
    db_uri: process.env.DB_URI,
    user_email: process.env.USER_EMAIL,
    user_password: process.env.USER_PASSWORD,
    origin: process.env.ORIGIN,
    port: process.env.PORT,
    access_key: process.env.ACCESS_KEY,
    refresh_key: process.env.REFRESH_KEY
}

export default config