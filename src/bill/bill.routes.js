'use strict'
import { Router } from "express"
import { createBill, test } from "./bill.controller.js"

const api = Router()
api.get('/test', test)
api.post('/createBill', createBill)

export default api