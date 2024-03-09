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
        
        let bill = await Bill.findById(id).populate('user',  ['username']).populate('items.product',['nameProduct', 'priceProduct']);
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
        let billFound = await Bill.find({user}).populate('user',  ['username']).populate('items.product',['nameProduct', 'priceProduct'])
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
        
        if (!bill)  throw new Error('Invoice not found')
        

        let doc = new PDFDocument()
        let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
        let formattedDate = bill.date.toLocaleDateString('es-ES', dateOptions)


        doc.font('Helvetica-Bold').fontSize(20).text('Factura de Venta', { align: 'center' }).moveDown(0.5)
        doc.font('Helvetica').fontSize(14)

    
        doc.text(`Número de Factura: ${bill._id}`, { align: 'left' })
        doc.text(`Cliente: ${bill.user.nameUser} ${bill.user.surname}`, { align: 'left' })
        doc.text(`Usuario: ${bill.user.username}`, { align: 'left' })
        doc.text(`Fecha: ${formattedDate}`, { align: 'left' }).moveDown(1)
        doc.font('Helvetica-Bold').fontSize(16).text('Productos:', { align: 'left' }).moveDown(0.5)
        doc.font('Helvetica').fontSize(14)
        for (let item of bill.items) {
            doc.text(`Producto: ${item.product.nameProduct}`, { continued: true }).text(`Cantidad: ${item.quantity}`, { align: 'right' })
            doc.text(`Precio: ${item.price}`, { align: 'right' })
            doc.moveDown(0.5)
        }

        doc.font('Helvetica-Bold').fontSize(16).text(`Total: ${bill.totalAmount}`, { align: 'right' }).moveDown(1)

        
        let pdfPath = `UpdatedBill_${bill._id}_${bill.user.username}.pdf`

        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()
        return pdfPath
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
    }
}

