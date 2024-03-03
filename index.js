//Ejecutar el sevidor 
import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import {createUserDefault} from './src/user/user.controller.js'

initServer()
connect()
createUserDefault()