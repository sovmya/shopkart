import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { wishlistApi } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cartItems, pendingIds, addToCart } = useCart();

  // ---------- wishlist ----------
  const [wishlistStatus, setWishlistStatus] = useState("idle");

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || wishlistStatus === "saved") return;
    setWishlistStatus("saving");
    try {
      await wishlistApi.post(`/${product._id}`);
      setWishlistStatus("saved");
    } catch (err) {
      setWishlistStatus("error");
    }
  };

  const wishlistLabel = {
    idle: "♡ Add to Wishlist",
    saving: "⏳ Saving...",
    saved: "♥ Added to Wishlist",
    error: "Unable to save. Try again.",
  }[wishlistStatus];

  // ---------- cart ----------
  const [cartError, setCartError] = useState("");

  const cartItem = cartItems.find((item) => item.product._id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isAdding = pendingIds.includes(product._id);
  const outOfStock = product.stock === 0;
  const maxReached = quantityInCart >= product.stock;

  const handleAddToCart = async () => {
    if (isAdding) return;
    setCartError("");
    const result = await addToCart(product._id);
    if (!result.ok) setCartError(result.message);
  };

  let cartLabel = "Add to Cart";
  if (isAdding) cartLabel = "Adding...";
  else if (outOfStock) cartLabel = "Out of Stock";
  else if (maxReached) cartLabel = "Max in Cart";
  else if (quantityInCart > 0) cartLabel = "Add Another";

  return (
    <div className="card">
      <div className="card-img-wrap">
        <img src={product.image} alt={product.name} className="card-img" />
      </div>
      <div className="card-body">
        <p className="card-category">{product.category}</p>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-price">₹{product.price.toLocaleString()}</p>
        <p className="card-stock">
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        {quantityInCart > 0 && <p className="card-note">{quantityInCart} in your cart</p>}
        {cartError && <p className="error-text">{cartError}</p>}

        <div className="card-actions">
          <button className="btn btn-dark" onClick={() => navigate(`/products/${product._id}`)}>
            View Details
          </button>
          <button
            className="btn btn-gold"
            onClick={handleAddToCart}
            disabled={isAdding || outOfStock || maxReached}
          >
            {cartLabel}
          </button>
          <button
            className={`btn btn-outline ${
              wishlistStatus === "saved" ? "is-saved" : wishlistStatus === "error" ? "is-error" : ""
            }`}
            onClick={handleAddToWishlist}
            disabled={wishlistStatus === "saving" || wishlistStatus === "saved"}
          >
            {wishlistLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;