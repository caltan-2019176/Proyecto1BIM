'use strict'

import Bill from './bill.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import {checkUpdateBillF} from '../utils/validator.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'


export const test = (req, res) => {
    console.log('test is running on Bill')
    return res.send({ message: 'test of Bill ir running correct' })
}

export const updateBill = async (req, res) => {
    try {
        let { id, itemId } = req.params
        let { product, quantity } = req.body

        let validate = await checkUpdateBillF(product, quantity)
        if(!validate) return res.status(400).send({ message: 'Product or quantity is required' })
        
        let bill = await Bill.findById(id)
        if (!bill) return res.status(404).send({ message: 'Bill not found' })
    
        let itemToUpdate = bill.items.find(item => item._id.toString() === itemId)
        if (!itemToUpdate) return res.status(404).send({ message: 'Item not found in the bill' })
        
        if (product) {
            let productInfo = await Product.findById(product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            
            let oldQuantity = itemToUpdate.quantity || 0;
            let oldUnitPrice = itemToUpdate.price || productInfo.priceProduct || 0;

            // Calcular la diferencia de cantidad
            let quantityDifference = quantity - oldQuantity;

            if (quantityDifference > 0 && productInfo.stock < quantityDifference) return res.status(400).send({ message: 'Insufficient stock' });
            
            // Actualizar el precio del artículo en la factura
            itemToUpdate.price = productInfo.priceProduct || 0;
            itemToUpdate.quantity = quantity;
            // Actualizar el totalAmount de la factura
            bill.totalAmount += quantityDifference * oldUnitPrice;

            productInfo.stock -= quantityDifference;
            await productInfo.save();
        }

        await bill.save();
        await generatePDFUpdated(bill)

        return res.send({ message: 'Item updated successfully', bill });
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating item' })
    }
}

export const searchBill = async(id) =>{
    try {
        let user = id
        let billFound = await Bill.find({user}).populate('user',  ['username']).populate('items.product',  ['nameProduct'])
        if(!billFound) return console.log('not found Bills')
        return billFound


    } catch (error) {
        console.error(error)
    }
}

export const searchBillID = async(req, res) =>{
    try {
        let {username} = req.body
        let userS = await User.findOne({username: username})
        if(!userS) return res.status(404).send({message: 'NOT FOUND User'})
        let user = userS._id
        let billFound = await Bill.find({user}).populate('user',  ['username']).populate('items.product',  ['nameProduct'])
        if(!billFound) return res.status(404).send({message: 'NOT FOUND BILL'})

        return res.send({billFound})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'BILL NOT FOUND'})
    }
}

export const generatePDFUpdated = async (id) => {
    try {

        let bill = await Bill.findOne({_id: id}).populate('user').populate('items.product')
        let doc = new PDFDocument()
        let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
        let formattedDate = bill.date.toLocaleDateString('es-ES', dateOptions)
        doc.fontSize(20).text('Bill Kinal Sales', { align: 'center' }).moveDown()

        doc.fontSize(14).text(`Bill No.: ${bill._id}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`People: ${bill.user.nameUser} ${bill.user.surname}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`User: ${bill.user.username}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`Date: ${formattedDate}`, { align: 'left' }).moveDown()

        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown()
        for (let item of bill.items) {
            doc.fontSize(14).text(`Product: ${item.product.nameProduct}, Quantity: ${item.quantity}, Price: ${item.price}`, { align: 'left' }).moveDown()
        }
        doc.fontSize(14).text(`Total Amount: ${bill.totalAmount}`, { align: 'left' }).moveDown()
 
        let pdfPath = `UpdateBill_${bill._id}_${bill.user.username}.pdf`
        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()

        return pdfPath
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
    }
}

