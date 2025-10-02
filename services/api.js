import axios from "axios";

const api = {
  login: async (credentials) => {
    const response = await axios.post("/api/login", credentials);
    return response.data;
  },
  registerAdmin: async (data) => {
    const response = await axios.post("/api/register-admin", data);
    return response.data;
  },
  qrLogin: async (body) => {
    const response = await axios.post("/api/qr-login", body);
    return response.data;
  },
  getChromecasts: async () => {
    const response = await axios.get("/api/chromecasts", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  addChromecast: async (device) => {
    const response = await axios.post("/api/chromecasts", device, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  deleteChromecast: async (mac) => {
    const response = await axios.delete(`/api/chromecasts/${mac}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  getSessions: async () => {
    const response = await axios.get("/api/sessions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  getMyChromecast: async () => {
    const response = await axios.get("/api/my-chromecast", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  startSession: async (mac) => {
    const response = await axios.post(
      "/api/sessions",
      { mac },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  },
  endSession: async () => {
    const response = await axios.delete("/api/sessions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
  getQRCode: async (roomId) => {
    const response = await axios.get(`/api/room/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  },
};

export { api };
