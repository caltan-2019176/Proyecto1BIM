'use strict'

import { Router } from "express"
import { deleteUser, login, register, test, updatePassword, updateRole, updateUser } from "./user.controller.js"
import{isAdmin, validateJwt} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.post('/register', register)
api.post('/login', login)
api.put('/updateUser',[validateJwt], updateUser)
api.delete('/deleteUser',[validateJwt], deleteUser)
api.put('/updateRole/:id',[validateJwt, isAdmin] ,updateRole)
api.put('/updatePassword', [validateJwt], updatePassword)

export default api