import express from 'express'
import {addRoom, updateRoom, addFavorite, searchRooms, getMyRooms, getPopular, getFavorites, getNearest, getCityRooms, getOneRoom, roomDetails} from '../controllers/room.js'
import {ownerRoute, customerRoute} from '../middleware/auth.js'

const router = express.Router()

router.post('/rooms', ownerRoute, addRoom)
router.patch('/rooms/:id', ownerRoute, updateRoom)
router.put('/rooms/favorite', customerRoute, addFavorite)
router.get('/search', searchRooms)
router.get('/rooms', ownerRoute, getMyRooms)
router.get('/rooms/popular', getPopular)
router.get('/rooms/favorite', customerRoute, getFavorites)
router.get('/rooms/nearest', getNearest)
router.get('/rooms/city/:city', getCityRooms)
router.get('/rooms/:id', ownerRoute, getOneRoom)
router.get('/rooms/:id/detail', roomDetails)

export default router