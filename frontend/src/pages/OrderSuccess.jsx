import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { orderApi } from "../services/api";

function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.get(`/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading your order...</p>}

        {!loading && error && (
          <div className="state-block">
            <h2 className="state-title">Something went wrong</h2>
            <p className="state-text">We couldn't load this order.</p>
            <button className="btn btn-dark" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="success-card">
            <p className="state-emoji">✅</p>
            <h1>Order Placed Successfully</h1>
            <div className="ornament">✦</div>

            <div className="success-details">
              <div className="info-row">
                <span className="info-label">Order ID</span>
                <span>{order._id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="status-pill">{order.status}</span>
              </div>
            </div>

            <p className="state-text">Your order has been saved successfully.</p>

            <div className="success-actions">
              <button className="btn btn-dark" onClick={() => navigate("/orders")}>
                View My Orders
              </button>
              <button className="btn btn-gold" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSuccess;