'use strict'
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