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

export const checkUpdateProduct = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.brand ||
            data.category) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateUser = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.password ||
            data.role) {
            return false
        }
        return true
    } else {
        return false
    }
}
export const checkUpdateCategory = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ) {
            return false
        }
        return true
    } else {
        return false
    }
}
export const checkUpdateRole = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.username||
            data.nameUser||
            data.email ||
            data.password ||
            data.phone ||
            data.surname) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdatePassword = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.username||
            data.nameUser||
            data.email ||
            data.role ||
            data.phone ||
            data.name) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateBill = async (data) => {

    if (Object.entries(data).length === 0 ||
        data.product ||
        data.quantity) {
        return true
    }
    return false
}

export const checkUpdateBillF = async (product, quantity) => {

    if (product ||
        quantity ||
        quantity != null) {
        return true
    }
    return false
}

export const checkCart = async (data, quantity, stock ) => {

    if (!data  || 
        stock === 0 ||
        quantity > stock) {
        return false
        
    }
    return true
}