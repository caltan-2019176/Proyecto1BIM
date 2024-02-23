'use strict'
import {Schema, model} from 'mongoose'

const billSchema = Schema({
    dateBill :{
        type: Date,
        default: Date.now,
        required: true
    }, 
    userBill: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, 
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        }, 
        amount: { 
            type: Number, 
            required: true 
        },
        unitePrice: { 
            type: Number, 
            required: true 
        },
        subTotal: { 
            type: Number,
            required: true 
        }
    }], 
    totalBill: {
        type: Number, 
        required: true 
    }
}, {
    versionKey: false //desactivar el _v (versión del documento)
})

export default model('bill', billSchema)