'use strict'


import Product from './product.model.js'
import Category from '../category/category.model.js'
import Bill from '../bill/bill.model.js'
import { checkUpdateProduct } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running on product')
    return res.send({ message: 'test of product ir running correct' })
}


export const addProduct = async (req, res)=>{
    try {
        //Recuperar la data del body
        let data = req.body
        console.log(data)
        if(!data.category){
            let categoryDefault = await Category.findOne({nameCategory: 'Default'})
            data.category = categoryDefault._id
        }
        let existProduct = await Product.findOne({nameProduct: data.nameProduct})
        if(existProduct) return res.status(401).send({message: 'This product is alredy exist'})
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
        
        let product = await Product.find().populate('category', ['nameCategory'])
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
        let update =  await checkUpdateProduct(data, id)
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
export const searchNameProduct = async (req, res)=>{
    try {
        let {name} = req.body
        let product = await Product.findOne({nameProduct: name}).populate('category', ['nameCategory'])
        return res.send({ product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error seraching product', error: error })
    }

}

export const sellingProducts = async (req, res) => {
    try {
        let bestSell = await Bill.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ])

        let productsDetail = await Product.find({ _id: { $in: bestSell.map(item => item._id) } })

        let sellingProdA = bestSell.map(item => {
            let detail = productsDetail.find(product => product._id.toString() === item._id.toString())
            return {
                product: detail,
                totalQuantity: item.totalQuantity
            }
        })
        return res.send(sellingProdA)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'No found selling products', error: error })
    }
}

export const soldOutProduct = async(req, res) =>{
    try {
        
        let product = await Product.find({stock: 0}).populate('category', ['nameCategory'])
        if(product.length === 0) return res.status(400).send({message: 'No products with stock = 0 found'})
        return res.send({message: 'Products with stock 0 found', product})

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching for sold out products ', error: error })
    }
}

export const getProductsCategory = async (req, res) =>{
    try {
        let {category} = req.body
        let categoryExist = await Category.findOne({nameCategory: category})
        if(!categoryExist) return res.status(404).send({message: 'Category not exist'})
        let findProduct = await Product.find({category: categoryExist._id})
        if(!findProduct) return res.status(404).send({message: 'fail found products'})
        return res.send(findProduct)
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'fail get products'})

    }
}

export const getProductsCoincidence = async (req, res) =>{
    try {
        let {product} = req.body
        let products = await Product.find({ nameProduct: {$regex: product, $options: 'i'}}).populate('category', ['nameCategory', 'descriptionCategory'])
        if(products.length === 0) return res.status(404).send({message: 'product not found'})
        return res.send({products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Faild get Producst by coincidence'})
    }
}
