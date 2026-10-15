import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/customers",
  withCredentials: true,
});

export const productApi = axios.create({
  baseURL: "http://localhost:5000/products",
  withCredentials: true,
});

export const wishlistApi = axios.create({
  baseURL: "http://localhost:5000/wishlist",
  withCredentials: true,
});

export const cartApi = axios.create({
  baseURL: "http://localhost:5000/cart",
  withCredentials: true,
});

export const orderApi = axios.create({
  baseURL: "http://localhost:5000/orders",
  withCredentials: true,
});

export default api;