import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Stack, 
  InputAdornment, 
  IconButton,
  CircularProgress
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon 
} from "@mui/icons-material";
import { useNotification } from "../../../context/NotificationContext";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Welcome back! Login successful.", "success");
        onLogin();
      } else {
        showNotification(data.error || "Login failed. Please check your credentials.", "error");
      }
    } catch (err) {
      showNotification("Could not connect to the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />
        
        <TextField
          fullWidth
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ 
            py: 1.5, 
            borderRadius: 3, 
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Sign In"}
        </Button>
      </Stack>
    </Box>
  );
}
