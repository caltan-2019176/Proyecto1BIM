'use strict'

import { Router } from "express"
import { deleteById, deleteUser, login, register, test, updateById, updatePassword, updateRole, updateUser } from "./user.controller.js"
import{isAdmin, validateJwt} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.post('/register', register)
api.post('/login', login)
api.put('/updateUser',[validateJwt], updateUser)
api.delete('/deleteUser',[validateJwt], deleteUser)
api.put('/updateRole/:id',[validateJwt, isAdmin] ,updateRole)
api.put('/updatePassword', [validateJwt], updatePassword)
api.delete('/deleteUserID/:id', [validateJwt, isAdmin], deleteById)
api.put('/updateUserId/:id', [validateJwt, isAdmin], updateById)

export default api