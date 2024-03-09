'use strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdatePassword, checkUpdateRole, checkUpdateUser} from '../utils/validator.js'
import {generatejwt} from '../utils/jwt.js'
import {searchBill} from '../bill/bill.controller.js'

export const test = (req, res) => {
    console.log('test is running on User')
    return res.send({ message: 'test of User ir running correct' })
}

export const createUserDefault = async(req, res)=>{
    try {
        let  userExist = await User.findOne({email: 'admin@proyect.com'})
        if (!userExist) {
        let passwordD = await encrypt('12345678')
        let newUser = new User({
            nameUser: 'Carlos',
            surname: 'Altán',
            username: 'caltan',
            password: passwordD,
            email: 'admin@proyect.com',
            phone: '12352602',
            role: 'ADMIN'
          });
        let user = new User(newUser)
        await user.save()
        console.log('User register correctly');
        } else {
        console.log('Alredy exist User.');
        }

    } catch (error) {
        console.error(error)
        if(error.keyValue.username) console.log(`username ${error.keyValue.username} is alredy taken ` )
        console.log('fail add user')
    }
}


export const register = async(req, res) =>{
    try {
        //recuperar los datos 
        let data = req.body
        console.log(data)
        //encriptar la password
        data.password = await encrypt(data.password)
        //dar el role
        data.role = 'CLIENT'
        //Guardar la información en la BD
        let user = new User(data)
        await user.save()
        //reponder al usuario 
        return res.send({message: `Registered successfully,${user.nameUser} was registered`})
    } catch (error) {
        console.error(error)
        if(error.keyValue.username) return res.status(400).send({message: `username ${error.keyValue.username} is alredy taken ` })
        return res.status(500).send({message: 'Failed add User', error: error})
    }
}

export const login = async (req, res) => {
    try {
        let data = req.body
        let loginUs = await User.findOne({
            $or:[ 
                {
                    username: data.username
                },
                {
                    email: data.email
                }
            ]
        })
        if(!loginUs) return res.status(404).send({message: 'error validate username or email'})

        if(loginUs){
            if( await checkPassword(data.password, loginUs.password)){
                let loggedUser = {
                    uid: loginUs._id,
                    username: loginUs.username, 
                    nameUser:  loginUs.nameUser,
                    role: loginUs.role 
                }
                let token = await generatejwt(loggedUser)
                let bills = await searchBill(loginUs._id)
                return res.send({message: `Welcome ${loggedUser.nameUser}`, loggedUser, token, bills})
            }else{
                return res.status(404).send({message: 'Password incorrect'})
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error login user', error: error})
    }

}

export const updateUser = async(req, res)=>{
    try {
        let data = req.body
        data._id = req.user._id
        console.log(data._id)
        let update =  await checkUpdateUser(data , data._id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update'})
        let updateUser = await User.findOneAndUpdate(
            { _id: data._id },
            data,
            {new: true} 
        )
        if (!updateUser) return res.status(401).send({ message: 'user not found' })
        return res.send({ message: 'user update', updateUser })
    } catch (error) {
        console.error(error)
        if(error.keyValue.username) return res.status(400).send({message: `username ${error.keyValue.username} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating' })
    }

}

export const deleteUser = async (req, res)=>{
    try {
        let data = req.body
        data._id = req.user._id
        if (data.password) {
            let user = await User.findById(data._id);
            if (!user) return res.status(401).send({ message: 'User not found' })
            let isPasswordValid = await checkPassword(data.password, user.password)
            if (!isPasswordValid) {
                return res.status(400).send({ message: 'The password is not correct' })
            } else {
                let deletedAccount = await User.findOneAndDelete({ _id: data._id })
                if (!deletedAccount) return res.status(404).send({ message: 'Account not found and not deleted' })
                return res.send({ message: `Account ${deletedAccount.username} deleted successfully` })
            }
        }else{
            return res.status(400).send({message: 'you have to introducing your password to delete your acount'})
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting account'})
    }

}


export const updateRole = async (req, res) =>{
    try {
        let {id} = req.params
        let data = req.body

        let update = checkUpdateRole(data, data._id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update'})
        let userFind =  await User.findOne({_id: id})
        if(!userFind) return res.status(404).send({message: 'user not found'})
        if(userFind.role === 'ADMIN'){
            data.role = 'CLIENT'
        }else{
            data.role = 'ADMIN'
        }
        let updateUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateUser) return res.status(401).send({ message: 'user not found' })
        return res.send({ message: 'Role update', updateUser })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating role' })
    }
}

export const updatePassword = async(req, res)=>{
    try {
        let data = req.body
        data._id = req.user._id
        let password = data.password
        let newPassword = data.newPassword
        if (password) {
            console.log(data.newPassword)
            let user = await User.findById(data._id);
            if (!user) return res.status(401).send({ message: 'User not found' })
    
            let isPasswordValid = await checkPassword(data.password, user.password)
            if (!isPasswordValid) {
                return res.status(400).send({ message: 'The password is not correct' })
            }else{
                data.password = await encrypt(data.newPassword )
            }
        }
        let update =  await checkUpdatePassword(data, data._id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be Update password'})
        let updateUser = await User.findOneAndUpdate(
            { _id: data._id },
            data,
            {new: true} 
        )
        if (!updateUser) return res.status(401).send({ message: 'user not found' })
        return res.send({ message: 'Update password', updateUser })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error Update password' })
    }

}

export const deleteById = async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findById(id);
        if (!user) return res.status(401).send({ message: 'User not found' })

        let deletedAccount = await User.findOneAndDelete({ _id: id })
        if (!deletedAccount) return res.status(404).send({ message: 'Account not found and not deleted' })
        return res.send({ message: `Account ${deletedAccount.username} deleted successfully` })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting account' })
    }

}

export const updateById = async(req, res)=>{
    try {
        let data = req.body
        let {id} = req.params
        let update =  await checkUpdateUser(data , id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update'})
        let updateUser = await User.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateUser) return res.status(401).send({ message: 'user not found' })
        return res.send({ message: 'user update', updateUser })
    } catch (error) {
        console.error(error)
        if(error.keyValue.username) return res.status(400).send({message: `username ${error.keyValue.username} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating' })
    }

}

