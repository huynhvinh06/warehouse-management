import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import CallMadeIcon from "@mui/icons-material/CallMade";
import StatCard from "../components/StatCard";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todayIn: 0,
    todayOut: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Lỗi tải dashboard:", err));
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        }}
      >
        <StatCard label="Tổng sản phẩm" value={stats.totalProducts} icon={<Inventory2Icon />} color="primary" />
        <StatCard label="Sắp hết hàng" value={stats.lowStock} icon={<WarningAmberIcon />} color="warning" />
        <StatCard label="Nhập hôm nay" value={stats.todayIn} icon={<CallReceivedIcon />} color="success" />
        <StatCard label="Xuất hôm nay" value={stats.todayOut} icon={<CallMadeIcon />} color="info" />
      </Box>
    </>
  );
}

export default Dashboard;
