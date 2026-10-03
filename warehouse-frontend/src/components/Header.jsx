import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, canAccess, ROLE_LABELS } from "../utils/api";

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const displayName = user?.full_name || user?.username || "";
  const roleLabel = user?.role_name
    ? ROLE_LABELS[user.role_name] || user.role_name
    : "";

  const closeMenu = () => setAnchorEl(null);

  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login", { replace: true });
  };

  // Chỉ hiện các mục mà vai trò hiện tại được phép vào
  const menuLinks = [
    { label: "Quản lý tài khoản", path: "/users", icon: <PeopleIcon fontSize="small" /> },
    { label: "Thông tin kho", path: "/warehouses", icon: <WarehouseIcon fontSize="small" /> },
  ].filter((item) => canAccess(item.path));

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="Mở hoặc đóng thanh bên"
          sx={{ mr: 1, "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" } }}
        >
          <MenuIcon />
        </IconButton>

        <WarehouseIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
          InoTrack
        </Typography>
        <Typography
          variant="body2"
          sx={{ ml: 2, opacity: 0.85, display: { xs: "none", md: "block" } }}
        >
          Quản lý xuất nhập kho
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mr: { xs: 0, sm: 1 },
              bgcolor: "rgba(255,255,255,0.25)",
              fontWeight: 700,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ textAlign: "left", lineHeight: 1.2, display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {roleLabel}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 210, borderRadius: 3 } } }}
        >
          {menuLinks.map((item) => (
            <MenuItem key={item.path} onClick={() => goTo(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}

          {menuLinks.length > 0 && <Divider />}

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
