import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Imports from "./pages/Imports";
import Exports from "./pages/Exports";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex" }}>
        <Header />
        <Sidebar />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Toolbar rỗng để đẩy nội dung xuống dưới Header (position="fixed") */}
          <Toolbar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/imports" element={<Imports />} />
            <Route path="/exports" element={<Exports />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<Users />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
