'use strict'

import jwt from 'jsonwebtoken'
const secretKey = '@LlaveSuperSecretaProyecto1BIM@'

export const generatejwt = async(payload)=>{
    try {
        return jwt.sign(payload, secretKey, {
            expiresIn: '3h', 
            algorithm: 'HS256'
        })
    } catch (error) {
        console.error(error)   
        return error
    }
}