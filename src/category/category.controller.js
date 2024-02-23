'use strict'

import Category from './category.model.js'
import { checkUpdate } from '../utils/validator.js'


export const test = (req, res) => {
    console.log('test is running on Categoty')
    return res.send({ message: 'test of Category ir running correct' })
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
        let update = checkUpdate(data, id)
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
        let deleteCategory =  await Category.findOneAndDelete({_id: id})
        if(!deleteCategory) return res.status(404).send({message: 'Category not found and not deleted'})
        if(deleteCategory)  return res.send({message: `Category ${deleteCategory.nameCategory} deleted successfully`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting Category', error: error })
        
    }
}