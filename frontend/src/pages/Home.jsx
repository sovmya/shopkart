import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        setCustomer(res.data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <p className="state-text" style={{ textAlign: "center", marginTop: "120px" }}>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="hero">
          <h1>Welcome, {customer.fullName}</h1>
          <p>Discover a curated collection, crafted for those who appreciate the finer things.</p>
          <button className="btn btn-gold" onClick={() => navigate("/products")}>
            Explore the Collection
          </button>
          <div className="ornament">✦</div>
        </div>

        <div className="panel">
          <h3>Your Account</h3>
          <div className="info-row">
            <span className="info-label">Name</span>
            <span>{customer.fullName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span>{customer.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span>{customer.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;