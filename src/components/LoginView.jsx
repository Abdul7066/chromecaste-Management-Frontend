/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"; // Added for URL params and navigation
import { api } from "../services/api";
import { setToken, decodeToken, isTokenValid } from "../utils/auth";

function LoginView({ onLogin, showSnackbar }) {
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    qrToken: "",
    room: "",
    mac: "",
  });
  const location = useLocation(); // To read URL query params
  const navigate = useNavigate(); // To clear query params after processing

  // Check for token in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token && isTokenValid(token)) {
      setLoading(true);
      try {
        setToken(token);
        onLogin(token);
        showSnackbar("Login successful via QR code", "success");
        // Clear query params from URL
        navigate(location.pathname, { replace: true });
      } catch (error) {
        showSnackbar("Invalid QR code token", "error");
        setLoading(false);
      }
    }
  }, [location.search, navigate, onLogin, showSnackbar]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      showSnackbar("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({
        username: form.username,
        password: form.password,
      });
      setToken(data.token);
      onLogin(data.token);
      showSnackbar("Admin login successful", "success");
    } catch (error) {
      showSnackbar(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.confirmPassword) {
      showSnackbar("Please fill in all fields", "warning");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showSnackbar("Passwords do not match", "error");
      return;
    }

    if (form.password.length < 6) {
      showSnackbar("Password must be at least 6 characters", "warning");
      return;
    }

    setLoading(true);
    try {
      await api.registerAdmin({
        username: form.username,
        password: form.password,
      });
      showSnackbar("Admin registered successfully! Please login.", "success");
      setMode("login");
      setForm({ ...form, password: "", confirmPassword: "" });
    } catch (error) {
      showSnackbar(error.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQRLogin = async (e) => {
    e.preventDefault();

    if (!form.qrToken && (!form.room || !form.mac)) {
      showSnackbar("Please provide QR token or room + MAC", "warning");
      return;
    }

    setLoading(true);
    try {
      const body = form.qrToken
        ? { token: form.qrToken }
        : { room: form.room, mac: form.mac };

      const data = await api.qrLogin(body);
      setToken(data.token);
      onLogin(data.token);
      showSnackbar("Guest login successful", "success");
    } catch (error) {
      showSnackbar(error.message || "QR login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 450,
          width: "100%",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Welcome
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Secure Chromecast Room Access
        </Typography>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Admin" />
          <Tab label="Guest" />
        </Tabs>

        {tab === 0 ? (
          <form
            onSubmit={mode === "login" ? handleAdminLogin : handleAdminRegister}
          >
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
            {mode === "register" && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                disabled={loading}
              />
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : mode === "login" ? (
                "Login as Admin"
              ) : (
                "Register Admin"
              )}
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setForm({ ...form, password: "", confirmPassword: "" });
              }}
              disabled={loading}
            >
              {mode === "login"
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleQRLogin}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scan the QR code in your room or enter details manually
            </Typography>
            <TextField
              fullWidth
              label="QR Token"
              margin="normal"
              placeholder="Paste token from QR scan"
              value={form.qrToken}
              onChange={(e) => setForm({ ...form, qrToken: e.target.value })}
              disabled={loading}
            />
            <Typography align="center" sx={{ my: 2 }} color="text.secondary">
              OR enter manually
            </Typography>
            <TextField
              fullWidth
              label="Room Number"
              margin="normal"
              placeholder="e.g., 202-B"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Chromecast MAC Address"
              margin="normal"
              placeholder="e.g., B0:E4:D5:A1:B8:D8"
              value={form.mac}
              onChange={(e) => setForm({ ...form, mac: e.target.value })}
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login as Guest"}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}

export default LoginView;
