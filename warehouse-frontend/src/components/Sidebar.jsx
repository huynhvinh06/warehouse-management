import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import { useNavigate, useLocation } from "react-router-dom";
import { canAccess } from "../utils/api";

const drawerWidth = 240;

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Sản phẩm", path: "/products", icon: <Inventory2Icon /> },
  { label: "Danh mục", path: "/categories", icon: <CategoryIcon /> },
  { label: "Nhà cung cấp", path: "/suppliers", icon: <LocalShippingIcon /> },
  { label: "Nhập kho", path: "/imports", icon: <CallReceivedIcon /> },
  { label: "Xuất kho", path: "/exports", icon: <CallMadeIcon /> },
  { label: "Báo cáo", path: "/reports", icon: <AssessmentIcon /> },
  { label: "Tồn kho", path: "/inventory", icon: <InventoryIcon /> },
  { label: "Kiểm kê", path: "/stocktakes", icon: <AssignmentTurnedInIcon /> },
  { label: "Nhật ký", path: "/audit-logs", icon: <HistoryIcon /> },
];

// open: trạng thái thanh bên trên máy tính; mobileOpen: trên màn hình nhỏ
function Sidebar({ open, isDesktop, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const content = (
    <>
      <Toolbar />

      <List sx={{ px: 1.5, py: 1.5 }}>
        {menuItems
          .filter((item) => canAccess(item.path))
          .map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={(theme) => ({
                borderRadius: 2.5,
                mb: 0.5,
                color: theme.palette.text.secondary,
                transition: "background-color .2s ease, transform .2s ease, color .2s ease",
                "& .MuiListItemIcon-root": {
                  minWidth: 40,
                  color: "inherit",
                  transition: "transform .2s ease",
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  transform: "translateX(4px)",
                  "& .MuiListItemIcon-root": { transform: "scale(1.12)" },
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                  color: theme.palette.primary.main,
                  boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.18),
                  },
                },
                "&.Mui-selected .MuiListItemText-primary": { fontWeight: 700 },
              })}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
    </>
  );

  // Màn hình nhỏ: thanh bên trượt ra đè lên nội dung, bấm ra ngoài để đóng
  if (!isDesktop) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
      >
        {content}
      </Drawer>
    );
  }

  // Máy tính: thu gọn hoàn toàn, nội dung giãn ra mượt nhờ hiệu ứng width
  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={(theme) => ({
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: open
            ? theme.transitions.duration.enteringScreen
            : theme.transitions.duration.leavingScreen,
        }),
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      })}
    >
      {content}
    </Drawer>
  );
}

export default Sidebar;
export { drawerWidth };
