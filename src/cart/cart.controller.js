'use strict'

import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import {checkCart} from '../utils/validator.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'


export const test = async(req, res)=>{
    return res.send({message: 'test cart'})
}

export const addCart = async (req, res) => {
    try {
        let { product, quantity, buy } = req.body

        let idUser = req.user._id
        console.log(idUser)

        if (!buy) {
            let data = await Product.findOne({_id: product})
            if(!data) return res.status(404).send({message: 'Data not found'})

            let check = await checkCart(data, quantity, data.stock)
            if (!check) return res.status(400).send({ message: 'Stock is Insufficient' })

            let cart = await Cart.findOne({ user: idUser })
            if (!cart) {
                let newCart = new Cart({
                    user: idUser,
                    items: [{ product: product, quantity }],
                    total: data.priceProduct * quantity  
                });
                await newCart.save();
            
                return res.send({ message: `This product is on the Cart Buy, ${newCart.total}` });
            }
      
            let productExist = cart.items.findIndex(p => p.product.equals(product));
            
            if (productExist !== -1) {
                cart.items[productExist].quantity += parseInt(quantity);
            } else {
                cart.items.push({ product: product, quantity: quantity });
            }
            
            cart.total = 0;
            for (let item of cart.items) {
                let productData = await Product.findById(item.product);
                if (productData) {
                    cart.total += productData.priceProduct * item.quantity;
                }
            }
            
            await cart.save();
            return res.send({ message: `Product add to Cart Buy. ${cart.total}` });
            
        } else if(buy.toUpperCase() === 'BUY'){
            console.log(buy)
            let cart = await Cart.findOne({ user: idUser })
            if (!cart) return res.status(400).send({ message: 'The cart has no products.' })

            for (let item of cart.items) {
                let { product, quantity } = item
                let existingProduct = await Product.findById(product)
                if (!existingProduct) {
                    return res.status(404).json({ message: `Product ${product} not found` })
                }
                if (quantity > existingProduct.stock) {
                    return res.status(400).json({ message: `Quantity ${existingProduct.nameProduct} exceeds stock` })
                }
            }

            let billItem = []
            for (let item of cart.items) {
                let data = await Product.findById(item.product)
                if (data) {
                    billItem.push({
                        product: item.product,
                        quantity: item.quantity,
                        price: data.priceProduct, 
                    })
                }
            }

            let bill = new Bill({
                user: cart.user,
                items: billItem,
                totalAmount: cart.total
            })

            for (let item of cart.items) {
                let data = await Product.findById(item.product)
                if (data) {
                    data.stock -= item.quantity
                    await data.save()
                }
            }

            let saveBill = await bill.save()
            await Cart.deleteOne({ _id: cart._id })
            await generatePDF(saveBill._id)
            return res.send({ message: 'Successful Buy.', bill: saveBill })
        }else{
            return res.status(400).send({ message: 'Please send BUY to finish your buy' })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering ', error: error })
    }
}

export const generatePDF = async (id) => {
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
 
        let pdfPath = `BillSale_${bill._id}_${bill.user.username}.pdf`
        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()

        return pdfPath
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
    }
}

export const generatePDFID = async (req, res) => {
    try {
        let {id} = req.params
        let bill = await Bill.findOne({_id: id}).populate('user').populate('items.product')
        if(!bill) return res.status(404).send({message: 'BILL NOT FOUND'})
        const doc = new PDFDocument()
        let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
        let formattedDate = bill.date.toLocaleDateString('es-ES', dateOptions)
        
        doc.fontSize(20).text('Bill Kinal Sales', { align: 'center' }).moveDown()

        doc.fontSize(14).text(`Bill No.: ${bill._id}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`People: ${bill.user.nameUser} ${bill.user.surname}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`User: ${bill.user.username}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`Date: ${formattedDate}`, { align: 'left' }).moveDown()

        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown()
        for (const item of bill.items) {
            doc.fontSize(14).text(`Product: ${item.product.nameProduct}, Quantity: ${item.quantity}, Price: ${item.price}`, { align: 'left' }).moveDown()
        }
        doc.fontSize(14).text(`Total Amount: ${bill.totalAmount}`, { align: 'left' }).moveDown()
 
        const pdfPath = `BillSale_${bill._id}_${bill.user.username}.pdf`
        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()

        return res.send({message: pdfPath})
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
        return res.status(500).send({message: 'fail generate pdf bill'})
    }
}

