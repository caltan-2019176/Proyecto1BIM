'use strict'

import { Router } from "express"
import { deleteUser, login, register, test, updateUser } from "./user.controller.js"
import{validateJwt} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.post('/register', register)
api.post('/login', login)
api.put('/updateUser/:id',[validateJwt], updateUser)
api.delete('/deleteUser/:id',[validateJwt], deleteUser)

export default api