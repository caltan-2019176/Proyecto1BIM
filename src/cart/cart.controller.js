'use strict'
import Cart from './cart.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
export const test = async(req, res)=>{
    return res.send({message: 'test cart'})
}

export const addCart = async(req, res) =>{
    try {
        const { user, product, quantity } = req.body;

        // Verificar si el usuario existe
        const userExist = await User.findById(user);
        if (!userExist) return res.status(404).send({ message: 'User not found' })
        // Verificar si el producto existe
        const productExist = await Product.findById(product);
        if (!productExist) return res.status(404).send({ message: 'Product not found' })
        
        // Crear un nuevo objeto de carrito con los datos proporcionados
        const cartItem = {
            product: product,
            quantity: quantity
        };

        // Verificar si el usuario ya tiene un carrito
        let userCart = await Cart.findOne({ user: user });
        if (!userCart) {
            // Si el usuario no tiene un carrito, crear uno nuevo
            userCart = new Cart({
                user: user,
                items: [cartItem]
            });
        } else {
            // Si el usuario ya tiene un carrito, agregar el objeto al carrito existente
            userCart.items.push(cartItem);
        }

        // Guardar el carrito actualizado
        await userCart.save();

        return res.send({ message: 'Product added to cart', cart: userCart });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to add product to cart' });
    }
}