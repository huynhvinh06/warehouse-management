import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { API_URL, getCurrentUser, saveSession } from "../utils/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Đã đăng nhập thì không cần vào lại trang đăng nhập
  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }

      saveSession(data.user, data.token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #0ea5e9 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 4,
          animation: "pageIn 0.5s ease-out",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <WarehouseIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            InoTrack
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống quản lý xuất nhập kho
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
            autoComplete="username"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="current-password"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      aria-label="Hiện/ẩn mật khẩu"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
