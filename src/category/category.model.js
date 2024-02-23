import { Schema, model } from "mongoose";

const categorySchema = Schema({
    nameCategory: {
        type: String,
        unique: true,
        required: true
    }, 
    descriptionCategory: {
        type: String, 
        required: true
    }

}, {
    versionKey: false //desactivar el _v (versión del documento)
})

export default model('category', categorySchema)