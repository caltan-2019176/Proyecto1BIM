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
            ref: 'product',
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

