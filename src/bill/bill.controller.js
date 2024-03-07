'use strict'

import Bill from './bill.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import {checkUpdateBill} from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running on Bill')
    return res.send({ message: 'test of Bill ir running correct' })
}

export const updateBill = async (req, res) => {
    try {
        let { id, itemId } = req.params
        let { product, quantity } = req.body

        if (!product && quantity == null) return res.status(400).send({ message: 'Product or quantity is required' })
        
        let bill = await Bill.findById(id)
        if (!bill) return res.status(404).send({ message: 'Bill not found' })
    
        let itemToUpdate = bill.items.find(item => item._id.toString() === itemId)
        if (!itemToUpdate) return res.status(404).send({ message: 'Item not found in the bill' })
        
        // Actualizar el producto
        if (product) {
            let productInfo = await Product.findById(product)
            if (!productInfo) return res.status(404).send({ message: 'Product not found' })
            
            itemToUpdate.product = product
            let oldQuantity = itemToUpdate.quantity || 0 
            let oldUnitPrice = itemToUpdate.price || productInfo.priceProduct || 0  
            
            
            if (quantity != null && (productInfo.stock - quantity + oldQuantity) < 0) return res.status(400).send({ message: 'Insufficient stock' })
            

            let quantityDifference = quantity - oldQuantity
            bill.totalAmount += quantityDifference * oldUnitPrice

            if (quantity != null) {
                productInfo.stock -= quantityDifference
                await productInfo.save()
            }
        }

        if (quantity != null) {
            let oldQuantity = itemToUpdate.quantity || 0
            let quantityDifference = quantity - oldQuantity
            itemToUpdate.quantity = quantity
            
            let itemPrice = itemToUpdate.price || 0
            bill.totalAmount += quantityDifference * itemPrice

            // Asegurar que no haya stock negativo
            let productInfo = await Product.findById(itemToUpdate.product)
            if (!productInfo) return res.status(404).send({ message: 'Product not found' })
            if ((productInfo.stock - quantityDifference) < 0) {
                return res.status(400).send({ message: 'Insufficient stock' })
            }
            productInfo.stock -= quantityDifference
            await productInfo.save()
        }

        await bill.save()

        return res.send({ message: 'Item updated successfully', bill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating item' })
    }
}

export const searchBill = async(id) =>{
    try {
        let user = id
        let billFound = await Bill.find({user}).populate('user',  ['username']).populate('items.product',  ['nameProduct'])
        if(!billFound) return console.log('not found Bills')
        return billFound


    } catch (error) {
        console.error(error)
    }
}

export const searchBillID = async(req, res) =>{
    try {
        let {username} = req.body
        let userS = await User.findOne({username: username})
        if(!userS) return res.status(404).send({message: 'NOT FOUND User'})
        let user = userS._id
        let billFound = await Bill.find({user}).populate('user',  ['username']).populate('items.product',  ['nameProduct'])
        if(!billFound) return res.status(404).send({message: 'NOT FOUND BILL'})

        return res.send({billFound})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'BILL NOT FOUND'})
    }
}


/*
export const updateBill = async (req, res) => {
    try {
        let { id, itemId } = req.params
        let { product, quantity } = req.body

        if (!product && quantity === undefined) return res.status(400).send({ message: 'Product or quantity is required' })
        
        let bill = await Bill.findById(id)
        if (!bill) return res.status(404).send({ message: 'Bill not found' })
    
        let itemToUpdate = bill.items.find(item => item._id.toString() === itemId)
        if (!itemToUpdate) return res.status(404).send({ message: 'Item not found in the bill' })
        
        // Actualizar el producto
        if (product) {
            let productInfo = await Product.findById(product)
            if (!productInfo) return res.status(404).send({ message: 'Product not found' })
            
            itemToUpdate.product = product
            itemToUpdate.price = productInfo.priceProduct || productInfo.priceProduct
            
            let oldUnitPrice = itemToUpdate.price || productInfo.priceProduct
            let oldQuantity = itemToUpdate.quantity || productInfo.quantity
            bill.totalAmount += (itemToUpdate.price - oldUnitPrice) * oldQuantity

            if (quantity !== undefined) {
                let quantityDifference = quantity - oldQuantity
                productInfo.stock -= quantityDifference
                await productInfo.save()
            }
        }

        if (quantity !== undefined) {
            let oldQuantity = itemToUpdate.quantity || 0
            let quantityDifference = quantity - oldQuantity
            itemToUpdate.quantity = quantity
            
            let itemPrice = itemToUpdate.price || 0
            bill.totalAmount += quantityDifference * itemPrice
            console.log(itemToUpdate.quantity)

            let productInfo = await Product.findById(itemToUpdate.product)
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' })
            }
            productInfo.stock -= quantityDifference
            await productInfo.save()
        }

        await bill.save()

        return res.send({ message: 'Item updated successfully', bill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating item' })
    }
}

*/
