import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();

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

        <div className="card-actions">
          <button className="btn btn-dark" onClick={() => navigate(`/products/${product._id}`)}>
            View Details
          </button>
          <button className="btn btn-outline is-saved" onClick={() => onRemove(product._id)}>
            Remove ♥
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;