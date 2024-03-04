//Ejecutar el sevidor 
import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import {createUserDefault} from './src/user/user.controller.js'
import{addCategoryDefault} from './src/category/category.controller.js'

initServer()
connect()
createUserDefault()
addCategoryDefault()