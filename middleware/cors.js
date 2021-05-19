import config from '../utils/config.js'

export default (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.origin)
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, X-HTTP-Method-Override')
    next()
}