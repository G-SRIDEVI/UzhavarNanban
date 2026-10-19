const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("uzhavar_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch (e) {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }
  return res.json();
};

export const api = {
  // Auth
  async login(credentials) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/api/auth/demo-accounts`);
    return handleResponse(res);
  },

  // Disease Requests & AI Doctor
  async createDiseaseRequest(formData) {
    const res = await fetch(`${API_BASE}/api/disease-requests`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async getMyDiseaseRequests() {
    const res = await fetch(`${API_BASE}/api/disease-requests/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getDiseaseRequest(id) {
    const res = await fetch(`${API_BASE}/api/disease-requests/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getQuotations(requestId) {
    const res = await fetch(`${API_BASE}/api/disease-requests/${requestId}/quotations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Dealer Operations
  async getDealerDiseaseRequests() {
    const res = await fetch(`${API_BASE}/api/dealer/disease-requests`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async submitDealerAssessment(requestId, assessment) {
    const res = await fetch(`${API_BASE}/api/dealer/disease-requests/${requestId}/assessments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(assessment),
    });
    return handleResponse(res);
  },

  async submitDealerQuotation(requestId, quotation) {
    const res = await fetch(`${API_BASE}/api/dealer/disease-requests/${requestId}/quotations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(quotation),
    });
    return handleResponse(res);
  },

  async getDealerOrders() {
    const res = await fetch(`${API_BASE}/api/dealer/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateOrderStatus(orderId, statusUpdate) {
    const res = await fetch(`${API_BASE}/api/dealer/orders/${orderId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(statusUpdate),
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/products?${qs}`);
    return handleResponse(res);
  },

  async getMyProducts() {
    const res = await fetch(`${API_BASE}/api/products/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createProduct(product) {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(res);
  },

  // Orders & Payment Sandbox
  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderPayload),
    });
    return handleResponse(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/api/orders/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOrder(orderId) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async verifyPayment(paymentPayload) {
    const res = await fetch(`${API_BASE}/api/payments/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(paymentPayload),
    });
    return handleResponse(res);
  },

  async confirmDelivery(orderId) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/confirm-delivery`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Crop Marketplace
  async browseCrops(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/crop-listings?${qs}`);
    return handleResponse(res);
  },

  async createCropListing(cropPayload) {
    const res = await fetch(`${API_BASE}/api/crop-listings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(cropPayload),
    });
    return handleResponse(res);
  },

  async getMyCrops() {
    const res = await fetch(`${API_BASE}/api/crop-listings/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async makeBuyerOffer(listingId, offerPayload) {
    const res = await fetch(`${API_BASE}/api/crop-listings/${listingId}/offers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(offerPayload),
    });
    return handleResponse(res);
  },

  async updateOfferStatus(offerId, status) {
    const res = await fetch(`${API_BASE}/api/crop-listings/offers/${offerId}/status?status_value=${status}`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Machinery
  async browseMachinery(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/machinery?${qs}`);
    return handleResponse(res);
  },

  async createMachinery(machineryPayload) {
    const res = await fetch(`${API_BASE}/api/machinery`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(machineryPayload),
    });
    return handleResponse(res);
  },

  async getMyMachinery() {
    const res = await fetch(`${API_BASE}/api/machinery/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async bookMachinery(listingId, bookingPayload) {
    const res = await fetch(`${API_BASE}/api/machinery/${listingId}/bookings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingPayload),
    });
    return handleResponse(res);
  },

  async getFarmerBookings() {
    const res = await fetch(`${API_BASE}/api/machinery/bookings/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getOwnerBookings() {
    const res = await fetch(`${API_BASE}/api/machinery/owner-bookings`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateBookingStatus(bookingId, status) {
    const res = await fetch(`${API_BASE}/api/machinery/bookings/${bookingId}/status?status_value=${status}`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Advisory Data
  async getMarketPrices() {
    const res = await fetch(`${API_BASE}/api/advisory/market-prices`);
    return handleResponse(res);
  },

  async getWeather() {
    const res = await fetch(`${API_BASE}/api/advisory/weather`);
    return handleResponse(res);
  },

  async getSchemes() {
    const res = await fetch(`${API_BASE}/api/advisory/government-schemes`);
    return handleResponse(res);
  },
};
