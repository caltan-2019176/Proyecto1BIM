'use strict'

import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import {checkCart} from '../utils/validator.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'


export const test = async (req, res) => {
    return res.send({ message: 'test cart' })
}

export const addCart = async (req, res) => {
    try {
        let { product, quantity, buy, remove } = req.body

        let idUser = req.user._id
        console.log(idUser)

        if (!buy && !remove) {
            let data = await Product.findOne({ _id: product })
            if (!data) return res.status(404).send({ message: 'Data not found' })

            let check = await checkCart(data, quantity, data.stock)
            if (!check) return res.status(400).send({ message: 'Stock is Insufficient' })

            let cart = await Cart.findOne({ user: idUser })
            if (!cart) {
                let newCart = new Cart({
                    user: idUser,
                    items: [{ product: product, quantity }],
                    total: data.priceProduct * quantity
                })
                await newCart.save()

                return res.send({ message: `This product is on the Cart Buy, ${newCart.total}` })
            }

            let productExist = cart.items.findIndex(p => p.product.equals(product))

            if (productExist !== -1) {
                cart.items[productExist].quantity += parseInt(quantity)
            } else {
                cart.items.push({ product: product, quantity: quantity })
            }

            cart.total = 0
            for (let item of cart.items) {
                let productData = await Product.findById(item.product)
                if (productData) {
                    cart.total += productData.priceProduct * item.quantity
                }
            }

            await cart.save()
            return res.send({ message: `Product add to Cart Buy. ${cart.total}` })

        } else if (remove && remove.toUpperCase() === 'REMOVE') {
            let cart = await Cart.findOne({ user: idUser })
            if (!cart) return res.status(400).send({ message: 'The cart has no products.' })
            // Buscar el índice del producto en el carrito
            let index = cart.items.findIndex(item => item.product.toString() === product.toString())
            if (index === -1) return res.status(404).send({ message: 'Product not found in the cart.' })

            let removedProduct = cart.items.splice(index, 1)[0]

            let productData = await Product.findById(removedProduct.product)
            if (!productData) {
                return res.status(404).send({ message: 'Product data not found.' })
            }

            console.log(removedProduct.quantity)
            console.log(productData.priceProduct)
            cart.total -= removedProduct.quantity * productData.priceProduct

            await cart.save()
            let cart1 = await Cart.findOne({ user: idUser }).populate('items.product',['nameProduct', 'priceProduct'])
            return res.send({ message: 'Product removed from the cart.', cart1 })

        } else if (buy.toUpperCase() === 'BUY') {
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

        
        let pdfPath = `Factura_Venta_${bill._id}_${bill.user.username}.pdf`

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

        
        let pdfPath = `Factura_Venta_${bill._id}_${bill.user.username}.pdf`

        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()
        return res.send({message: pdfPath})
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
        return res.status(500).send({message: 'fail generate pdf bill'})
    }
}

