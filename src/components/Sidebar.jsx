import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 220;

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Sản phẩm", path: "/products", icon: <Inventory2Icon /> },
  { label: "Kho hàng", path: "/warehouses", icon: <WarehouseIcon /> },
  { label: "Nhập kho", path: "/imports", icon: <CallReceivedIcon /> },
  { label: "Xuất kho", path: "/exports", icon: <CallMadeIcon /> },
  { label: "Báo cáo", path: "/reports", icon: <AssessmentIcon /> },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
export { drawerWidth };
