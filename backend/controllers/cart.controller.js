const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Helper: load the user's cart with full product info (populate)
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });
  // if a product was deleted from the DB, its reference becomes null: skip those
  return customer.cart.filter((item) => item.product);
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);

    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity; 
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: "Quantity must be a whole number" });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);

    const item = customer.cart.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock`,
      });
    }

    item.quantity = quantity;
    await customer.save();

    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    console.error("Update quantity error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.user._id);

    const exists = customer.cart.some((i) => i.product.toString() === productId);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    customer.cart = customer.cart.filter((i) => i.product.toString() !== productId);
    await customer.save();

    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };