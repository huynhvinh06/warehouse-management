import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, Toolbar, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Imports from "./pages/Imports";
import Exports from "./pages/Exports";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import AuditLogs from "./pages/AuditLogs";
import Stocktakes from "./pages/Stocktakes";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory";
import { getCurrentUser, canAccess } from "./utils/api";

// Khung giao diện chính; chưa đăng nhập thì chuyển về trang đăng nhập
function ProtectedLayout() {
  const theme = useTheme();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"), { noSsr: true });

  // Trạng thái thanh bên: máy tính nhớ lựa chọn lần trước, màn hình nhỏ mặc định đóng
  const [desktopOpen, setDesktopOpen] = useState(
    () => localStorage.getItem("sidebarOpen") !== "false"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tự đóng thanh bên trên màn hình nhỏ sau khi chuyển trang
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    if (isDesktop) {
      const next = !desktopOpen;
      setDesktopOpen(next);
      localStorage.setItem("sidebarOpen", String(next));
    } else {
      setMobileOpen((v) => !v);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar
        open={desktopOpen}
        isDesktop={isDesktop}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        {/* Toolbar rỗng để đẩy nội dung xuống dưới Header (position="fixed") */}
        <Toolbar />
        {/* key theo đường dẫn để mỗi lần chuyển trang chạy lại hiệu ứng xuất hiện */}
        <Box key={location.pathname} sx={{ animation: "pageIn 0.35s ease-out" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

// Chặn truy cập trực tiếp bằng URL vào trang không đủ quyền
function RoleRoute({ path, children }) {
  return canAccess(path) ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/warehouses" element={<RoleRoute path="/warehouses"><Warehouses /></RoleRoute>} />
          <Route path="/imports" element={<Imports />} />
          <Route path="/exports" element={<Exports />} />
          <Route path="/stocktakes" element={<Stocktakes />} />
          <Route path="/reports" element={<RoleRoute path="/reports"><Reports /></RoleRoute>} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/users" element={<RoleRoute path="/users"><Users /></RoleRoute>} />
          <Route path="/audit-logs" element={<RoleRoute path="/audit-logs"><AuditLogs /></RoleRoute>} />
          <Route path="/inventory" element={<Inventory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
