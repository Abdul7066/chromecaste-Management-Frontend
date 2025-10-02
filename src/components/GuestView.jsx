import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PlayArrow, Stop, Tv, CheckCircle } from "@mui/icons-material";
import { api } from "../services/api";

function GuestView({ user, showSnackbar }) {
  const [chromecast, setChromecast] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChromecast();
  }, []);

  const fetchChromecast = async () => {
    setLoading(true);
    try {
      const data = await api.getMyChromecast();
      setChromecast(data);
      // Automatically start session if chromecast is found
      if (data && !session) {
        await startSession(data.mac);
      }
    } catch (error) {
      showSnackbar(error.message || "Failed to fetch device info", "error");
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (mac) => {
    try {
      const data = await api.startSession(mac);
      setSession(data);
      showSnackbar("Casting session started automatically", "success");
    } catch (error) {
      showSnackbar(error.message || "Failed to start session", "error");
    }
  };

  const handleEndSession = async () => {
    try {
      await api.endSession();
      setSession(null);
      showSnackbar("Session ended successfully", "success");
    } catch (error) {
      showSnackbar(error.message || "Failed to end session", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome to Room {user.room}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Control your room's Chromecast device
        </Typography>
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ mb: 3, wordBreak: "break-all" }}
        >
          Login Token: {user.token}
        </Typography>

        {chromecast ? (
          <Box>
            <Card
              sx={{
                mb: 3,
                bgcolor: session ? "#e8f5e9" : "#e3f2fd",
                border: "2px solid",
                borderColor: session ? "#4caf50" : "#1976d2",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Tv sx={{ fontSize: 48, mr: 2, color: "#1976d2" }} />
                  <Box>
                    <Typography variant="h6">Chromecast Device</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontFamily="monospace"
                    >
                      {chromecast.mac}
                    </Typography>
                  </Box>
                </Box>
                {session && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "success.main",
                    }}
                  >
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Connected and ready to cast
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {session ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your casting session is active. You can now cast content from
                  your device to the TV.
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Stop />}
                  onClick={handleEndSession}
                >
                  Stop Casting Session
                </Button>
              </Box>
            ) : (
              <Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => startSession(chromecast.mac)}
                >
                  Start Casting Session
                </Button>
              </Box>
            )}

            <Paper
              sx={{
                mt: 3,
                p: 3,
                bgcolor: "#fafafa",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                How to Cast:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Ensure the casting session is active above
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Open a compatible app (YouTube, Netflix, etc.)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Tap the cast icon and select your room's Chromecast
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Alert severity="error">
            No Chromecast device found for your room. Please contact the front
            desk.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default GuestView;
