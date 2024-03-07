'use strict'

import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
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
            console.log(data.stock)//Verifica el stock del producto
            if (!data || data.stock === 0 || quantity > data.stock) return res.status(400).send({ message: 'Stock is Insufficient' })
        
            let cart = await Cart.findOne({ user: idUser })

            if (!cart) {
                let newCart = new Cart({
                    user: idUser,
                    items: [{ product: product, quantity }],
                    total: data.priceProduct * quantity  
                });
                await newCart.save();
            
                return res.send({ message: `This product is on de Cart Buy, ${newCart.total}` });
            }
            
            // Verifica si el producto ya existe en el carrito
            let productExist = cart.items.findIndex(p => p.product.equals(product));
            
            if (productExist !== -1) {
                // Si el producto ya existe, actualiza la cantidad
                cart.items[productExist].quantity += parseInt(quantity);
            } else {
                // Si el producto no existe, agrégalo al carrito
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
            
        } else {
            console.log(buy)
            if (buy !== 'BUY') return res.status(400).send({ message: 'Please send BUY to finish your buy' })

            let cart = await Cart.findOne({ user: idUser })
            //Verificar que el carrito no benga vacío
            if (!cart) {
                return res.status(400).send({ message: 'The cart has no products.' })
            }
            //volver a verificar el stock del producto
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

            // Mandar los datos del carrito a la factura
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
            let saveBill = await bill.save()

            for (let item of cart.items) {
                let data = await Product.findById(item.product)
                if (data) {
                    data.stock -= item.quantity
                    await data.save()
                }
            }
            await Cart.deleteOne({ _id: cart._id })

            await generatePDF(saveBill._id)

            return res.send({ message: 'Successful purchase.', bill: saveBill })
        }

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering ', error: error })
    }
}

export const generatePDF = async (id) => {
    try {

        let bill = await Bill.findOne({_id: id}).populate('user').populate('items.product')
        const doc = new PDFDocument()
        
        doc.fontSize(20).text('Bill Kinal Sales', { align: 'center' }).moveDown()

        doc.fontSize(14).text(`Bill No.: ${bill._id}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`People: ${bill.user.nameUser} ${bill.user.surname}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`User: ${bill.user.username}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`Date: ${bill.date}`, { align: 'left' }).moveDown()

        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown()
        for (const item of bill.items) {
            doc.fontSize(14).text(`Product: ${item.product.nameProduct}, Quantity: ${item.quantity}, Price: ${item.price}`, { align: 'left' }).moveDown()
        }
        doc.fontSize(14).text(`Total Amount: ${bill.totalAmount}`, { align: 'left' }).moveDown()
 
        const pdfPath = `BillSale_${bill._id}.pdf`
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
        
        doc.fontSize(20).text('Bill Kinal Sales', { align: 'center' }).moveDown()

        doc.fontSize(14).text(`Bill No.: ${bill._id}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`People: ${bill.user.nameUser} ${bill.user.surname}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`User: ${bill.user.username}`, { align: 'left' }).moveDown()
        doc.fontSize(14).text(`Date: ${bill.date}`, { align: 'left' }).moveDown()

        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown()
        for (const item of bill.items) {
            doc.fontSize(14).text(`Product: ${item.product.nameProduct}, Quantity: ${item.quantity}, Price: ${item.price}`, { align: 'left' }).moveDown()
        }
        doc.fontSize(14).text(`Total Amount: ${bill.totalAmount}`, { align: 'left' }).moveDown()
 
        const pdfPath = `BillSale_${bill._id}.pdf`
        doc.pipe(fs.createWriteStream(pdfPath))
        doc.end()

        return res.send({message: pdfPath})
    } catch (error) {
        console.error('Error generating invoice PDF:', error)
        return res.status(500).send({message: 'fail generate pdf bill'})
    }
}





/*
import Cart from './cart.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
export const test = async(req, res)=>{
    return res.send({message: 'test cart'})
}

export const addCart = async(req, res) =>{
    try {
        const { userId, items } = req.body;

        // Verificar si el usuario existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verificar y actualizar el stock de los productos en el carrito
        for (const item of items) {
            const { product, quantity } = item;
            const existingProduct = await Product.findById(product);
            if (!existingProduct) {
                return res.status(404).json({ message: `Product with ID ${product} not found` });
            }
            if (quantity > existingProduct.stock) {
                return res.status(400).json({ message: `Quantity of ${existingProduct.nameProduct} exceeds stock` });
            }
        }

        // Crear un nuevo documento de carrito
        const newCart = new Cart({
            user: userId,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity
            }))
        });
        await newCart.save();

        res.status(201).json({ message: 'Cart created successfully', cart: newCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding items to cart' });
    }
}
*/

/*

export const addToCart = async (req, res) => {
    try {
        const { user, items } = req.body;

        // Verificar si el usuario existe
        const userExist = await User.findById(user);
        if (!userExist) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Verificar si los productos existen y construir la lista de objetos de carrito
        const cartItems = [];
        for (const item of items) {
            const { product, quantity } = item;

            const productExist = await Product.findById(product);
            if (!productExist) {
                return res.status(404).send({ message: `Product with ID ${product} not found` });
            }

            cartItems.push({
                product: product,
                quantity: quantity
            });
        }

        // Verificar si el usuario ya tiene un carrito
        let userCart = await Cart.findOne({ user: user });
        if (!userCart) {
            // Si el usuario no tiene un carrito, crear uno nuevo
            userCart = new Cart({
                user: user,
                items: cartItems
            });
        } else {
            // Si el usuario ya tiene un carrito, agregar los objetos al carrito existente
            userCart.items.push(...cartItems);
        }

        // Guardar el carrito actualizado
        await userCart.save();

        return res.send({ message: 'Products added to cart', cart: userCart });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to add products to cart' });
    }
}
*/

/*{
  "userId": "65d81ed4a221c97198300bc1",
  "items": [
    {
      "product": "65d83059a7d3675f10e54e58",
      "quantity": 2
    },
    {
      "product": "65cef219a153b6b933661689",
      "quantity": 3
    }
    
  ]
}
*/