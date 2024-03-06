'use strict'

import { Schema, model } from "mongoose";

const billSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: { 
        type: Number,
        required: true 
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    versionKey: false
});

export default model('Bill', billSchema);


/*
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

export default model('bill', billSchema)*/