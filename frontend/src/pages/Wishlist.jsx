import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wishlistApi } from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await wishlistApi.get("/");
      setWishlist(res.data.wishlist);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.delete(`/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert("Could not remove product. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading your wishlist...</p>}

        {!loading && error && (
          <div className="state-block">
            <h2 className="state-title">Something went wrong</h2>
            <p className="state-text">Unable to load wishlist.</p>
            <button className="btn btn-dark" onClick={fetchWishlist}>Try Again</button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="state-block">
            <p className="state-emoji">❤️</p>
            <h2 className="state-title">Your wishlist is empty</h2>
            <p className="state-text">Save products you love and find them here later.</p>
            <button className="btn btn-gold" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <>
            <div className="page-head">
              <h1 className="page-title">My Wishlist</h1>
              <p className="page-subtitle">{wishlist.length} products saved</p>
              <div className="ornament">✦</div>
            </div>
            <div className="grid">
              {wishlist.map((product) => (
                <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;