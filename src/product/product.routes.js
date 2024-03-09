'use strict'

import { Router } from "express"
import {addProduct, sellingProducts, deleteProduct, getProduct, getProductsCategory, searchNameProduct, searchProduct, soldOutProduct, test, updateProduct, getProductsCoincidence} from './product.controller.js'
import {validateJwt, isAdmin, isClient} from '../middlewares/validate-jwt.js'
const api = Router()

api.get('/test', test)
api.get('/getProduct',[validateJwt], getProduct)
api.get('/searchProduct/:search',[validateJwt], searchProduct)
api.get('/sellingProducts', [validateJwt], sellingProducts)


api.post('/addProduct',[validateJwt, isAdmin], addProduct)
api.put('/updateProduct/:id',[validateJwt, isAdmin], updateProduct)
api.delete('/deleteProduct/:id',[validateJwt, isAdmin], deleteProduct)
api.get('/soldOutProduct',[validateJwt, isAdmin], soldOutProduct)
api.get('/searchNameProduct', [validateJwt, isClient], searchNameProduct )
api.get('/getProductsCategory', [validateJwt, isClient], getProductsCategory)
api.get('/getProductsCoincidence', [validateJwt], getProductsCoincidence)
export default api