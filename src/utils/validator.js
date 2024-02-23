'use strict'

import { hash, compare} from 'bcrypt'

export const encrypt = (password)=>{
    try {

        return hash(password, 10)

    } catch (error) {
        console.error(error)
        return error
    }

}

export const checkPassword = async(password, hash)=>{
    try {
        return await compare(password, hash)
    } catch (error) {
        console.error(error)
        return error
    }
}


export const checkUpdate = (data, id)=>{
    if(id){//FOR CATEGORY
        if(Object.entries(data).length === 0 ){
            return false
        }
        return true
    }else{//FOR PRODUCT 
        if(Object.entries(data).length === 0 ||
            data.description ||
            data.description == ''||
            data.brand ||
            data.brand ==''){
            return false
        }
        if (Object.entries(data).length === 0 ||
            data.password ||
            data.password == '' ) {
            return false
        }
        return true
    }
    
}