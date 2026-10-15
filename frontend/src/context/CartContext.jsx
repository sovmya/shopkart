import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { cartApi } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pendingIds, setPendingIds] = useState([]); // which products have a request in flight

  // ---------- fetch the cart from backend ----------
  const refreshCart = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await cartApi.get("/");
      setCartItems(res.data.cart);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]); // not logged in: just an empty cart, not an "error"
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // load once when the app starts
  useEffect(() => {
    refreshCart();
  }, []);

  // ---------- shared helper for every mutation ----------
  const runMutation = async (productId, request) => {
    setPendingIds((prev) => [...prev, productId]);
    try {
      const res = await request();
      setCartItems(res.data.cart); // backend returns the updated cart: use it as truth
      return { ok: true };
    } catch (err) {
      // on failure we do NOT touch cartItems, so the UI stays consistent
      return {
        ok: false,
        message: err.response?.data?.message || "Something went wrong",
      };
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const addToCart = (productId) =>
    runMutation(productId, () => cartApi.post(`/${productId}`));

  const updateQuantity = (productId, quantity) =>
    runMutation(productId, () => cartApi.patch(`/${productId}`, { quantity }));

  const removeFromCart = (productId) =>
    runMutation(productId, () => cartApi.delete(`/${productId}`));

  const clearCart = () => setCartItems([]); // used on logout

  // ---------- derived values (NOT stored anywhere, calculated) ----------
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    loading,
    error,
    pendingIds,
    cartCount,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// custom hook so components can just write: const { cartCount } = useCart();
export function useCart() {
  return useContext(CartContext);
}