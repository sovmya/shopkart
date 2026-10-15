import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { orderApi } from "../services/api";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await orderApi.get("/");
      setOrders(res.data.orders);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading your orders...</p>}

        {!loading && error && (
          <div className="state-block">
            <h2 className="state-title">Something went wrong</h2>
            <p className="state-text">Unable to load your orders.</p>
            <button className="btn btn-dark" onClick={fetchOrders}>Try Again</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state-block">
            <p className="state-emoji">📦</p>
            <h2 className="state-title">No orders yet</h2>
            <p className="state-text">You have not placed any orders yet.</p>
            <button className="btn btn-gold" onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <div className="page-head">
              <h1 className="page-title">My Orders</h1>
              <p className="page-subtitle">{orders.length} orders placed</p>
              <div className="ornament">✦</div>
            </div>
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;