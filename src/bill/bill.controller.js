'use strict'

import Bill from './bill.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
import { checkUpdate } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running on Bill')
    return res.send({ message: 'test of Bill ir running correct' })
}

export const createBill = async (req, res) => {
    try {
        let { userBill, products } = req.body
        //let id = '65d83cb7931b7cd15cbac83a'
        // Verificar si el usuario existe
        let user = await User.findById(userBill)
        if (!user) {
            return res.status(404).send({ message: `User not found ${userBill}` })
        }

        // Verificar y actualizar el stock de los productos
        for (const key in products) {
            if (Object.hasOwnProperty.call(products, key)) {
                const { productId, amount } = products[key];
                const existingProduct = await Product.findById(productId);
                if (!existingProduct) {
                    return res.status(404).json({ message: `Product with ID ${productId} not found` });
                }
                if (amount > existingProduct.stock) {
                    return res.status(400).json({ message: `Insufficient stock for product ${existingProduct.nameProduct}` });
                }
                existingProduct.stock -= amount;
                await existingProduct.save();
            }
        }

        // Calcular el total de la factura
        console.log('Products:', products);
        console.log('Type of products:', typeof products);

        if (products && typeof products === 'object' && !Array.isArray(products)) {
            const totalBill = Object.values(products).reduce((total, product) => {
                let { amount, unitePrice } = product;
                return total + (amount * unitePrice);
            }, 0);
        }
        // Crear la factura
        const newBill = new Bill({
            userBill,
            products: products.map(product => ({
                product: product.productId,
                amount: product.amount,
                unitePrice: product.unitePrice,
                subTotal: product.amount * product.unitePrice
            })),
            totalBill
        })

        // Guardar la factura en la base de datos
        await newBill.save()

        // Respuesta exitosa
        return res.send({ message: 'Bill created successfully', bill: newBill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Failed to create bill' })
    }
}












/*
export const createBill = async (req, res) => {
    try {
        // Desestructurar el body de la solicitud
        let { userBill , products, totalBill } = req.body;
        
        // Verificar si el usuario existe
        const user = await User.findById(userBill);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        // Verificar y actualizar el stock de los productos
        for (const productBill of products) {
            const existProduct = await Product.findById(productBill.product);
            if (!existProduct) {
                return res.status(404).send({ message: `Product with ID ${productBill.product} not found` });
            }
            if (productBill.amount > existProduct.stock) {
                return res.status(400).send({ message: `The amount of ${existProduct.nameProduct} is insufficient` });
            }
            existProduct.stock -= productBill.amount;
            await existProduct.save();
        }

        // Calcular subtotal de cada producto y crear un nuevo arreglo de productos con subtotales
        const productsWithSubtotal = products.map(product => ({
            ...product,
            subTotal: product.amount * product.unitePrice
        }));

        // Crear la factura
        const newBill = new Bill({
            userBill,
            products: productsWithSubtotal,
            totalBill
        });
        await newBill.save();
        return res.send({ mensaje: 'New Bill', bill: newBill });

    } catch (error) {
        console.error(error);
        res.status(500).send({ mensaje: 'Fail create Bill' });
    }
}*/
