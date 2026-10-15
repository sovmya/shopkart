import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
    } finally {
      clearCart();
      navigate("/login");
    }
  };

  return (
    <nav className="nav">
      <span className="nav-logo">SHOPKART</span>
      <div className="nav-links">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/wishlist" className="nav-link">Wishlist</Link>
        <Link to="/orders" className="nav-link">Orders</Link>
        <Link to="/cart" className="nav-link">
          Cart<span className="nav-badge">{cartCount}</span>
        </Link>
        <button className="nav-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;