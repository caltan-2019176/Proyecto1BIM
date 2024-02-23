'use strict'

import { Router } from "express"
import {addProduct, deleteProduct, getProduct, searchProduct, soldOutProduct, test, updateProduct} from './product.controller.js'
import {validateJwt, isAdmin, isClient} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.get('/getProduct', getProduct)
api.get('/searchProduct/:search', searchProduct)

api.post('/addProduct',[validateJwt, isAdmin], addProduct)
api.put('/updateProduct/:id',[validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id',[validateJwt, isAdmin], deleteProduct)
api.get('/soldOutProduct',[validateJwt, isAdmin], soldOutProduct)
export default api