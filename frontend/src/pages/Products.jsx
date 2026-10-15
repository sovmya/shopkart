import { useEffect, useState } from "react";
import { productApi } from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;

        const res = await productApi.get("/", { params });
        setProducts(res.data.products);
      } catch (err) {
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-head">
          <h1 className="page-title">The Collection</h1>
          <p className="page-subtitle">Thoughtfully selected, beautifully made</p>
          <div className="ornament">✦</div>
        </div>

        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
        />

        {loading && <p className="state-text" style={{ textAlign: "center" }}>Loading products...</p>}

        {!loading && error && <p className="state-text" style={{ textAlign: "center" }}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="state-text" style={{ textAlign: "center" }}>No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;