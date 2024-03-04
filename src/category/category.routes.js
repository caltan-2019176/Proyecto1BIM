'use strict'

import { Router } from "express"
import {addCategory, deleteCategory, getCategory, test, updateCategory} from './category.controller.js'
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'

const api = Router()
api.get('/test', test)
api.post('/addCategory',[validateJwt, isAdmin], addCategory)
api.get('/getCategory', [validateJwt], getCategory)
api.put('/updateCategory/:id',[validateJwt, isAdmin], updateCategory )
api.delete('/deleteCategory/:id',[validateJwt, isAdmin], deleteCategory)

export default api