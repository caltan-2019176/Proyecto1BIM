'use strict'

import {Router} from 'express'
import { addCart, generatePDFID, test } from './cart.controller.js'
import {validateJwt, isClient, isAdmin} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/addCart',[validateJwt, isClient], addCart)
api.get('/pdf/:id', [validateJwt, isAdmin], generatePDFID)

export default api