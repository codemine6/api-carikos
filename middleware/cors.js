import config from '../utils/config.js'

export default (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type')
    next()
}