'use strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdate} from '../utils/validator.js'
import {generatejwt} from '../utils/jwt.js'

export const test = (req, res) => {
    console.log('test is running on User')
    return res.send({ message: 'test of User ir running correct' })
}

export const register = async(req, res) =>{
    try {
        //recuperar los datos 
        let data = req.body
        console.log(data)
        //encriptar la password
        data.password = await encrypt(data.password)
        //Guardar la información en la BD
        let user = new User(data)
        await user.save()
        //reponder al usuario 
        return res.send({message: `Registered successfully,${user.nameUser} was registered`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Failed add User', error: error})
    }
}

export const login = async (req, res)=>{
    try {
        //Capturar el body (los datos)
        let {username, password} = req.body
        //Validar que el usuario exista
        let user = await User.findOne({username})
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username, 
                name:  user.nameUser,
                role: user.role 
            }
            //Generar el token
            let token = await generatejwt(loggedUser)
            //Responder al usuario 
            return res.send({message: `Welcome ${loggedUser.name}`, loggedUser, token})
        }
        if(!user) return res.status(404).send({message: 'User not found'})
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error to login'})
        
    }
}

export const updateUser = async (req, res) =>{
    try {
        let {id} = req.params 
        let data = req.body 
        let update =  checkUpdate(data, false)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update'})
        //validar los permisos
        //Actualizar
        let updateUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        //Validar la actualización 
        if (!updateUser) return res.status(401).send({ message: 'user not found' })
        //responder al usuario
        return res.send({ message: 'user update', updateUser })

    } catch (error) {
        console.error(error)
        if(error.keyValue.username) return res.status(400).send({message: `username ${error.keyValue.username} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating' })
        
    }
}

export const deleteUser = async(req, res) =>{
    try {
        let {id} = req.params
        let deletedAccount = await User.findOneAndDelete({_id: id})
        if(!deletedAccount) return res.status(404).send({message: 'Account not found and not deleted'})
        return res.send({message: `Account ${deletedAccount.username} deleted successfully`}) 
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting account'})
        
    }
}