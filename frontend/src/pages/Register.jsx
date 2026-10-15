import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError("All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await api.post("/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-crest">SHOPKART</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us and discover the collection</p>

        {error && <p className="error-text">{error}</p>}

        <input className="input" type="text" name="fullName" placeholder="Full name"
          value={formData.fullName} onChange={handleChange} />
        <input className="input" type="email" name="email" placeholder="Email address"
          value={formData.email} onChange={handleChange} />
        <input className="input" type="password" name="password" placeholder="Password"
          value={formData.password} onChange={handleChange} />
        <input className="input" type="text" name="phone" placeholder="Phone number"
          value={formData.phone} onChange={handleChange} />

        <button className="btn btn-gold btn-block" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;