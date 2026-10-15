import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productApi.get(`/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        setError("Something went wrong while loading this product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading product...</p>}
        {!loading && error && <p className="state-text" style={{ textAlign: "center" }}>{error}</p>}

        {!loading && !error && product && (
          <>
            <button className="link-back" onClick={() => navigate("/products")}>
              ← Back to Collection
            </button>
            <div className="details">
              <img src={product.image} alt={product.name} className="details-img" />
              <div className="details-info">
                <p className="card-category">{product.category}</p>
                <h1>{product.name}</h1>
                <p className="details-desc">{product.description}</p>
                <p className="details-price">₹{product.price.toLocaleString()}</p>
                <p className="card-stock">
                  {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
                </p>
                <button className="btn btn-gold" style={{ marginTop: "12px" }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;