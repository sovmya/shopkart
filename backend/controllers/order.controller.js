const mongoose = require("mongoose");
const crypto = require("crypto");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// returns an error message string, or null if the address is valid
const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of fields) {
    if (typeof address[field] !== "string" || !address[field].trim()) {
      return `${field} is required`;
    }
  }

  if (!/^\d{10}$/.test(address.phone.trim())) {
    return "Phone must be a 10-digit number";
  }
  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return "Pincode must contain 6 digits";
  }
  return null;
};

// POST /orders/create-payment-order
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body; // totalAmount / prices from the client are never read

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // reload the LATEST product data for every cart item
    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Please remove it and try again.",
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      // snapshot: copy purchase-time data into the order
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity; // server-side total
    }

    // store only the clean, trimmed address fields
    const cleanAddress = {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine1: shippingAddress.addressLine1.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pincode.trim(),
    };

    // 1) ShopKart order, PENDING_PAYMENT. The cart is NOT touched.
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: cleanAddress,
      totalAmount,
    });

    // 2) Razorpay order (amount in paise)
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (err) {
      console.error("Razorpay order error:", err.error?.description || err.message);
      await Order.findByIdAndDelete(order._id); // don't leave a useless pending order
      return res.status(502).json({
        success: false,
        message: "Could not start the payment. Please try again.",
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // safe data only: Key ID is public, Key Secret never leaves the server
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    // the order must belong to the logged-in user
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // already verified earlier: just return it (safe to call twice)
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({ success: true, message: "Payment already verified", order });
    }

    // the browser's order id must match the one WE saved in the database
    if (razorpay_order_id !== order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Order mismatch" });
    }

    // build the expected signature using the STORED razorpay order id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(razorpay_signature));

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      // order stays PENDING, cart stays untouched
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // signature is genuine: confirm the order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ONLY NOW clear the cart
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({ success: true, message: "Payment verified", order });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /orders
const getOrders = async (req, res) => {
  try {
    // only paid orders: abandoned/pending checkouts shouldn't appear in history
    const orders = await Order.find({ user: req.user._id, paymentStatus: "PAID" }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get orders error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    // searching by BOTH id and user means other people's orders are simply "not found"
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };