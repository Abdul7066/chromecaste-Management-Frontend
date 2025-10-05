import axios from "axios";

const VITE_API_BASE_URL = "http://chromecaste-Management.onrender.com";
const api = {
  login: async (credentials) => {
    const response = await axios.post(
      `${VITE_API_BASE_URL}/api/auth/login`,
      credentials
    );
    return response.data;
  },
  registerAdmin: async (data) => {
    const response = await axios.post(
      `${VITE_API_BASE_URL}/api/auth/register-admin`,
      data
    );
    return response.data;
  },
  qrLogin: async (body) => {
    const response = await axios.post(
      `${VITE_API_BASE_URL}/api/auth/qr-login`,
      body
    );
    return response.data;
  },
  getChromecasts: async () => {
    const response = await axios.get(`${VITE_API_BASE_URL}/api/chromecasts`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  addChromecast: async (device) => {
    const response = await axios.post(
      `${VITE_API_BASE_URL}/api/chromecasts`,
      device,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
  deleteChromecast: async (mac) => {
    const response = await axios.delete(
      `${VITE_API_BASE_URL}/api/chromecasts/${mac}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
  getSessions: async () => {
    const response = await axios.get(`${VITE_API_BASE_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  getMyChromecast: async () => {
    const response = await axios.get(
      `${VITE_API_BASE_URL}/api/chromecasts/my-chromecast`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
  startSession: async (mac) => {
    const response = await axios.post(
      `${VITE_API_BASE_URL}/api/sessions`,
      { mac },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
  endSession: async () => {
    const response = await axios.delete(`${VITE_API_BASE_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  getQRCode: async (roomId) => {
    const response = await axios.get(
      `${VITE_API_BASE_URL}/api/room/${roomId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
};

export { api };
