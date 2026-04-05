// ============================================================
//  utils/api.js — API Helper
//  All API calls go through these simple functions
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

// ---- Helper: get stored user token ----
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('cm_user'));
  return user ? user.token : null;
};

// ---- fetch helper ----
// Using fetch API to talk to Express backend
const request = async (method, endpoint, body = null) => {
  const headers = { 'Content-Type': 'application/json' };

  // Attach token if available (no JWT library needed on frontend)
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ---- Auth endpoints ----
export const signup = (formData) => request('POST', '/auth/signup', formData);
export const login = (formData) => request('POST', '/auth/login', formData);

// ---- Product endpoints ----
//  GET request — fetch all products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request('GET', `/products${query ? '?' + query : ''}`);
};

// GET request — single product by ID
export const getProduct = (id) => request('GET', `/products/${id}`);

//  POST request — create a product
export const createProduct = (data) => request('POST', '/products', data);

//  PUT request — update a product
export const updateProduct = (id, data) => request('PUT', `/products/${id}`, data);

//  DELETE request — delete a product
export const deleteProduct = (id) => request('DELETE', `/products/${id}`);

// My listings
export const getMyListings = () => request('GET', '/products/my/listings');

// ---- Order endpoints ----
export const placeOrder = (productId) => request('POST', '/orders', { productId });
export const getMyOrders = () => request('GET', '/orders/mine');

// ---- Wishlist endpoints ----
export const toggleWishlist = (productId) => request('POST', `/wishlist/${productId}`);
export const getMyWishlist = () => request('GET', '/wishlist/mine');
export const checkWishlist = (productId) => request('GET', `/wishlist/check/${productId}`);

// ---- Seller: incoming orders + mark as sold ----
export const getIncomingOrders = () => request('GET', '/orders/incoming');
export const updateOrderStatus = (id, status) => request('PUT', `/orders/${id}/status`, { status });
