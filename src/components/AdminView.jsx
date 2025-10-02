import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Add, Delete, QrCode2, Refresh } from "@mui/icons-material";
import { api } from "../services/api";

function AdminView({ user, showSnackbar }) {
  const [tab, setTab] = useState(0);
  const [chromecasts, setChromecasts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState({
    open: false,
    room: "",
    qrCode: "",
    token: "",
  });
  const [newDevice, setNewDevice] = useState({
    mac: "",
    room: "",
    url: "hdmi://1",
  });

  useEffect(() => {
    if (tab === 0) fetchChromecasts();
    if (tab === 1) fetchSessions();
  }, [tab]);

  const fetchChromecasts = async () => {
    setLoading(true);
    try {
      const data = await api.getChromecasts();
      setChromecasts(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar(error.message || "Failed to fetch devices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar(error.message || "Failed to fetch sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.mac || !newDevice.room) {
      showSnackbar("Please fill in all required fields", "warning");
      return;
    }

    try {
      await api.addChromecast({
        mac: newDevice.mac,
        tags: { type: "CC", RN: newDevice.room },
        url: newDevice.url || "hdmi://1",
      });
      showSnackbar("Device added successfully", "success");
      setAddDialog(false);
      setNewDevice({ mac: "", room: "", url: "hdmi://1" });
      fetchChromecasts();
    } catch (error) {
      showSnackbar(error.message || "Failed to add device", "error");
    }
  };

  const handleDeleteDevice = async (mac) => {
    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      await api.deleteChromecast(mac);
      showSnackbar("Device deleted successfully", "success");
      fetchChromecasts();
    } catch (error) {
      showSnackbar(error.message || "Failed to delete device", "error");
    }
  };

  const handleGenerateQR = async (room) => {
    try {
      const response = await api.getQRCode(room); // Fetch QR code from backend
      setQrDialog({
        open: true,
        room,
        qrCode: response.qrCode, // Base64-encoded QR image
        token: response.token, // JWT token
      });
    } catch (error) {
      showSnackbar(error.message || "Failed to generate QR code", "error");
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Chromecast Devices" />
          <Tab label="Active Sessions" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Manage Devices
            </Typography>
            <Box>
              <IconButton onClick={fetchChromecasts} sx={{ mr: 1 }}>
                <Refresh />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialog(true)}
              >
                Add Device
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : chromecasts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No devices registered yet. Add your first Chromecast device.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {chromecasts.map((device) => (
                <Grid item xs={12} md={6} lg={4} key={device.mac}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            Room {device.tags?.RN || "Unknown"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            MAC: {device.mac}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            URL: {device.url}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleGenerateQR(device.tags?.RN)}
                            title="Generate QR Code"
                          >
                            <QrCode2 />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDevice(device.mac)}
                            title="Delete Device"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Session Logs
            </Typography>
            <IconButton onClick={fetchSessions}>
              <Refresh />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : sessions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No sessions recorded yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Room</strong>
                    </TableCell>
                    <TableCell>
                      <strong>MAC Address</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Started At</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{session.room || "N/A"}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {session.chromecastMac}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(session.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={session.active ? "Active" : "Ended"}
                          color={session.active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Add Device Dialog */}
      <Dialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Chromecast Device</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="MAC Address"
            margin="normal"
            placeholder="B0:E4:D5:A1:B8:D8"
            value={newDevice.mac}
            onChange={(e) =>
              setNewDevice({ ...newDevice, mac: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Room Number"
            margin="normal"
            placeholder="202-B"
            value={newDevice.room}
            onChange={(e) =>
              setNewDevice({ ...newDevice, room: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="URL"
            margin="normal"
            placeholder="hdmi://1"
            value={newDevice.url}
            onChange={(e) =>
              setNewDevice({ ...newDevice, url: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddDevice}>
            Add Device
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialog.open}
        onClose={() =>
          setQrDialog({ open: false, room: "", qrCode: "", token: "" })
        }
      >
        <DialogTitle>QR Code for Room {qrDialog.room}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", p: 2 }}>
            <img
              src={qrDialog.qrCode}
              alt="QR Code"
              style={{
                maxWidth: "100%",
                height: "auto",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Scan this QR code to log in as a guest for Room {qrDialog.room}.
            </Typography>
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{ mt: 2, wordBreak: "break-all" }}
            >
              Token: {qrDialog.token}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setQrDialog({ open: false, room: "", qrCode: "", token: "" })
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminView;
