const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const protect = require("../middlewares/auth.middleware");

router.get("/", protect, getCart);
router.post("/:productId", protect, addToCart);
router.patch("/:productId", protect, updateQuantity);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;