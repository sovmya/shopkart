import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, cartCount, subtotal, refreshCart } = useCart();

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading your cart...</p>}

        {!loading && error && (
          <div className="state-block">
            <h2 className="state-title">Something went wrong</h2>
            <p className="state-text">Unable to load your cart.</p>
            <button className="btn btn-dark" onClick={refreshCart}>Try Again</button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="state-block">
            <p className="state-emoji">🛒</p>
            <h2 className="state-title">Your cart is empty</h2>
            <p className="state-text">Looks like you haven't added anything yet.</p>
            <button className="btn btn-gold" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <>
            <div className="page-head">
              <h1 className="page-title">My Cart</h1>
              <div className="ornament">✦</div>
            </div>
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </div>

              <div className="summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Items</span>
                  <span>{cartCount}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString()}</strong>
                </div>
                <button
                  className="btn btn-gold btn-block"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;