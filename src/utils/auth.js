import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => localStorage.setItem("token", token);

export const removeToken = () => localStorage.removeItem("token");

export const decodeToken = (token) => jwtDecode(token);

export const isTokenValid = (token) => {
  try {
    const payload = decodeToken(token);
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch (err) {
    return false;
  }
};
