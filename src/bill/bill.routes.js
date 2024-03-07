'use strict'
import { Router } from "express"
import {  test, updateBill, searchBillID } from "./bill.controller.js"
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'

const api = Router()
api.get('/test', test)
api.put('/updateBill/:id/:itemId', [validateJwt, isAdmin], updateBill)
api.get('/findBill', [validateJwt, isAdmin], searchBillID)

export default api