const BASE_URL = "/api"; // proxied to my Express server by Vite

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token"); // we'll wire this up properly in the login step

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};