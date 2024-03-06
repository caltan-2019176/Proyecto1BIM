import { Schema, model } from "mongoose";

const cartSchema = Schema({
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
        }
    }],
    total: { 
        type: Number,
        required: true 
    }
},{
    versionKey: false
})

export default model('cart', cartSchema)