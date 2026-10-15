import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { orderApi } from "../services/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const fields = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma" },
  { name: "phone", label: "Phone", placeholder: "10-digit mobile number" },
  { name: "addressLine1", label: "Address", placeholder: "House no., street, area" },
  { name: "city", label: "City", placeholder: "Bengaluru" },
  { name: "state", label: "State", placeholder: "Karnataka" },
  { name: "pincode", label: "Pincode", placeholder: "6-digit pincode" },
];

const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = "Phone must be a 10-digit number.";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Pincode must contain 6 digits.";
  return errors;
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, subtotal, clearCart } = useCart();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError("");

    // client validation: no backend call if this fails
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const shippingAddress = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    setPlacing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError("Could not load the payment gateway. Check your internet and try again.");
        setPlacing(false);
        return;
      }

      // backend validates cart + stock, calculates the total, creates both orders
      const res = await orderApi.post("/create-payment-order", { shippingAddress });
      const data = res.data;

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        // runs after Razorpay says the payment went through.
        // We do NOT trust it: we send the details to our backend to verify.
        handler: async (response) => {
          try {
            await orderApi.post("/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
            clearCart(); // frontend cart state -> empty, Navbar shows Cart (0)
          } catch (err) {
            setServerError(
              err.response?.data?.message ||
                "We could not verify your payment. Your cart has not been cleared."
            );
            setPlacing(false);
          }
        },

        // user closed the popup without paying
        modal: {
          ondismiss: () => setPlacing(false),
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        theme: { color: "#c9a24b" },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", () => {
        setServerError("Payment failed. Your cart has not been cleared. Please try again.");
        setPlacing(false);
      });

      paymentObject.open();
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  // ---------- empty cart guard ----------
  if (!loading && cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="state-block">
            <p className="state-emoji">🛒</p>
            <h2 className="state-title">Your cart is empty</h2>
            <p className="state-text">Add something to your cart before checking out.</p>
            <button className="btn btn-gold" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-head">
          <h1 className="page-title">Checkout</h1>
          <div className="ornament">✦</div>
        </div>

        {loading ? (
          <p className="state-text" style={{ textAlign: "center" }}>Loading your cart...</p>
        ) : (
          <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
            <div className="checkout-form">
              <h3 className="section-title">Shipping Details</h3>

              {fields.map((f) => (
                <div className="field" key={f.name}>
                  <label className="field-label" htmlFor={f.name}>{f.label}</label>
                  <input
                    id={f.name}
                    className="input"
                    type="text"
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    disabled={placing}
                  />
                  {errors[f.name] && <p className="error-text">{errors[f.name]}</p>}
                </div>
              ))}

              {serverError && <p className="error-text error-box">{serverError}</p>}
            </div>

            <div className="summary">
              <h3>Order Summary</h3>

              {cartItems.map((item) => (
                <div className="summary-row" key={item.product._id}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="summary-row summary-total">
                <span>Total</span>
                <strong>₹{subtotal.toLocaleString()}</strong>
              </div>

              <button className="btn btn-gold btn-block" type="submit" disabled={placing}>
                {placing ? "Processing..." : "Pay with Razorpay"}
              </button>
              <p className="summary-note">
                Test Mode: no real money is charged. The final amount is calculated securely on the server.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Checkout;