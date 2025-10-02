import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Logout, Tv, Person } from "@mui/icons-material";
import { useLocation } from "react-router-dom"; // For reading URL query params
import LoginView from "./components/LoginView";
import AdminView from "./components/AdminView";
import GuestView from "./components/GuestView";
import { getToken, removeToken, decodeToken, isTokenValid } from "./utils/auth";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const location = useLocation(); // Hook to access URL query params

  useEffect(() => {
    // Check for token in local storage first
    let token = getToken();
    let validToken = token && isTokenValid(token);

    // If no valid token in storage, check URL query params (e.g., from QR scan)
    if (!validToken) {
      const params = new URLSearchParams(location.search);
      token = params.get("token");
      validToken = token && isTokenValid(token);
    }

    if (validToken) {
      const payload = decodeToken(token);
      setUser({ ...payload, token });
      setView(payload.role === "admin" ? "admin" : "guest");
      // Optionally store token in local storage for persistence
      localStorage.setItem("token", token);
    }
  }, [location.search]);

  const handleLogin = (token) => {
    const payload = decodeToken(token);
    setUser({ ...payload, token });
    setView(payload.role === "admin" ? "admin" : "guest");
    localStorage.setItem("token", token); // Persist token
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setView("login");
    showSnackbar("Logged out successfully", "info");
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Tv sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chromecast Isolation System
          </Typography>
          {user && (
            <>
              <Chip
                icon={<Person />}
                label={user.username || user.room}
                color="secondary"
                sx={{ mr: 2 }}
              />
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {view === "login" && (
          <LoginView onLogin={handleLogin} showSnackbar={showSnackbar} />
        )}
        {view === "admin" && (
          <AdminView user={user} showSnackbar={showSnackbar} />
        )}
        {view === "guest" && (
          <GuestView user={user} showSnackbar={showSnackbar} />
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackbar}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
