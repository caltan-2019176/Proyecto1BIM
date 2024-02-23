'use strict'

import {Router} from 'express'
import { addCart, test } from './cart.controller.js'

const api = Router()

api.get('/test', test)
api.post('/addCart', addCart)

export default api