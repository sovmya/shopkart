import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { orderApi } from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(false);
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
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading order...</p>}

        {!loading && error && (
          <div className="state-block">
            <h2 className="state-title">Order not found</h2>
            <p className="state-text">We couldn't find this order.</p>
            <button className="btn btn-dark" onClick={() => navigate("/orders")}>
              Back to My Orders
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <button className="link-back" onClick={() => navigate("/orders")}>
              ← Back to My Orders
            </button>

            <div className="panel" style={{ maxWidth: "720px" }}>
              <div className="order-head">
                <h3>Order #{order._id.slice(-8)}</h3>
                <span className="status-pill">{order.status}</span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item-line" key={item._id}>
                    <span>{item.name} × {item.quantity} (₹{item.price.toLocaleString()} each)</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="info-row">
                <span className="info-label">Total</span>
                <strong>₹{order.totalAmount.toLocaleString()}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Payment</span>
                <span>{order.paymentStatus}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ship to</span>
                <span style={{ textAlign: "right" }}>
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city}<br />
                  {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.phone}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;