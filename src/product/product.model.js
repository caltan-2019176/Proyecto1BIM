'use strict'
import { Schema, model } from "mongoose"; 

const productSchema = Schema({
    nameProduct: {
        type: String, 
        required: true
    }, 
    descriptionProduct: {
        type: String, 
        required: true
    },
    priceProduct: {
        type: Number, 
        required: true
    }, 
    brand: {
        type: String, 
        required: true
    }, 
    stock: {
        type: Number, 
        required: true
    }, 
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category', 
        required: true

    }, 
}, {
    versionKey: false 
})

export default model('product', productSchema)