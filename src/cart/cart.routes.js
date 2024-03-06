'use strict'

import {Router} from 'express'
import { addCart, test } from './cart.controller.js'
import {validateJwt, isClient} from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/addCart',[validateJwt, isClient], addCart)

export default api