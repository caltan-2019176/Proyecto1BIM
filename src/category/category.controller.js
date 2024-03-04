'use strict'

import Category from './category.model.js'
import Product from '../product/product.model.js'
import { checkUpdateCategory } from '../utils/validator.js'


export const test = (req, res) => {
    console.log('test is running on Categoty')
    return res.send({ message: 'test of Category ir running correct' })
}

export const addCategoryDefault = async (req, res) =>{
    try {
        let  categoryExist = await Category.findOne({nameCategory: 'Default'})
        if (!categoryExist) {
            let newCategory = new Category({
                nameCategory: 'Default',
                descriptionCategory: 'Default category',
              });
            let category = new Category(newCategory)
            await category.save()
            console.log('Category register correctly');
            } else {
            console.log('Alredy exist Category.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category')
        
    }
}

export const addCategory = async(req, res) =>{
    try {
        let data = req.body
        console.log(data)
        let category = new Category(data)
        await category.save()
        return res.send({message: `Registered successfully,${category.nameCategory} was registered`})        
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategory ) return res.status(400).send({message: `Name ${error.keyValue.nameCategory} is alredy taken ` })
        return res.status(500).send({message: 'Error registering category', error: error})
    }
}

export const getCategory = async(req, res)=>{
    try {
        let category = await Category.find()
        if(!category) return res.status(404).send({message: 'Category not found'})
        return res.send({ category})
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing category', error: error })
    }
}

export const updateCategory = async(req, res)=>{
    try {
        let {id} = req.params
        let data = req.body
        let update = await checkUpdateCategory(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing data'})
        let updateCategory = await Category.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateCategory) return res.status(401).send({ message: 'Category not found' })
        return res.send({ message: 'Category update', updateCategory })
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategory ) return res.status(400).send({message: `Name ${error.keyValue.nameCategory} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating' })
        
    }
}

export const deleteCategory = async (req, res)=>{
    try {
        let{id} = req.params
        //Categoria por default
        let categoryDefault = await Category.findOne({nameCategory: 'Default'})
        let idDefualt = categoryDefault._id
        //eliminar
        let deleteCategory =  await Category.findOneAndDelete({_id: id})
        //validar
        if(!deleteCategory) return res.status(404).send({message: 'Category not found and not deleted'})
        //Actualizar el id del producto
        await Product.updateMany({ category: id }, { $set: { category: idDefualt } });
        //Responder al user
        return res.send({message: `Category ${deleteCategory.nameCategory} deleted successfully`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting Category', error: error })
        
    }
}