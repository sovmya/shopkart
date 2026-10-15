import { useNavigate } from "react-router-dom";

function OrderCard({ order }) {
  const navigate = useNavigate();

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="order-card">
      <div className="order-head">
        <div>
          <h3>Order #{order._id.slice(-8)}</h3>
          <p className="order-date">{date}</p>
        </div>
        <span className="status-pill">{order.status}</span>
      </div>

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item-line" key={item._id}>
            <span>{item.name} × {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="order-foot">
        <strong>Total: ₹{order.totalAmount.toLocaleString()}</strong>
        <button className="btn btn-outline" onClick={() => navigate(`/orders/${order._id}`)}>
          View Details
        </button>
      </div>
    </div>
  );
}

export default OrderCard;