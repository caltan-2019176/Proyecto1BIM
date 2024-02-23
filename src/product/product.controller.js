'use strict'


import Product from './product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running on product')
    return res.send({ message: 'test of product ir running correct' })
}


export const addProduct = async (req, res)=>{
    try {
        //Recuperar la data del body
        let data = req.body
        console.log(data)
        //Mandar la data al producto
        let product = new Product(data)
        //guardar las datos 
        await product.save()
        //responder al usuario
        return res.send({message: `Registered successfully,${product.nameProduct} was registered`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error registering product', error: error})
    }
}

export const getProduct = async (req, res)=>{
    try {
        
        let product = await Product.find()
        if(!product) return res.status(404).send({message: 'Product not found'})
        return res.send({product})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing product', error: error })
    }
}

export const updateProduct = async(req, res)=>{
    try {
        let {id} = req.params
        let data = req.body
        let update =  checkUpdate(data, false)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing data'})
        let updateProduct = await Product.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        ).populate('category', ['nameCategory'])
        if (!updateProduct) return res.status(401).send({ message: 'Product not found' })
        return res.send({ message: 'Product  update', updateProduct })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating' })
    }
}

export const deleteProduct = async(req, res)=>{
    try {
        let {id} = req.params
        let deletedProduct =  await Product.findOneAndDelete({_id: id})
        if(!deletedProduct) return res.status(404).send({message: 'Product not found and not deleted'})
        return res.send({message: `Product ${deletedProduct.nameProduct} deleted successfully`})
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting Product', error: error })
        
    }

}


export const searchProduct = async (req, res)=>{
    try {
        let {search} = req.params
        let product = await Product.find({_id: search}).populate('category', ['nameCategory'])
        return res.send({ product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error seraching product', error: error })
    }

}

export const soldOutProduct = async(req, res) =>{
    try {
        //Buscar productios agotados 
        let product = await Product.find({stock: 0})
        //validar 
        if(product.length === 0) return res.status(400).send({message: 'No products with stock = 0 found'})
        return res.send({message: 'Products with stock 0 found', product})

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching for sold out products ', error: error })
    }
}