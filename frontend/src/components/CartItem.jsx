import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const navigate = useNavigate();
  const { pendingIds, updateQuantity, removeFromCart } = useCart();
  const [error, setError] = useState("");

  const { product, quantity } = item;
  const busy = pendingIds.includes(product._id);

  const handleChange = async (newQuantity) => {
    setError("");
    const result = await updateQuantity(product._id, newQuantity);
    if (!result.ok) setError(result.message);
  };

  const handleRemove = async () => {
    setError("");
    const result = await removeFromCart(product._id);
    if (!result.ok) setError(result.message);
  };

  return (
    <div className="cart-row">
      <img
        src={product.image}
        alt={product.name}
        className="cart-img"
        onClick={() => navigate(`/products/${product._id}`)}
      />

      <div className="cart-info">
        <h3>{product.name}</h3>
        <p className="cart-unit">₹{product.price.toLocaleString()} each</p>

        <div>
          <div className="qty">
            <button onClick={() => handleChange(quantity - 1)} disabled={busy || quantity <= 1}>
              −
            </button>
            <span>{quantity}</span>
            <button onClick={() => handleChange(quantity + 1)} disabled={busy || quantity >= product.stock}>
              +
            </button>
          </div>
          {busy && <span className="updating">Updating...</span>}
        </div>

        <button className="link-danger" onClick={handleRemove} disabled={busy}>
          Remove
        </button>
        {error && <p className="error-text" style={{ marginTop: "6px" }}>{error}</p>}
      </div>

      <div className="line-total">₹{(product.price * quantity).toLocaleString()}</div>
    </div>
  );
}

export default CartItem;