import { useEffect, useState } from "react";
import { Typography, Grid } from "@mui/material";
import StatCard from "../components/StatCard";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todayIn: 0,
    todayOut: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Lỗi tải dashboard:", err));
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tổng sản phẩm" value={stats.totalProducts} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Sắp hết hàng" value={stats.lowStock} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Nhập hôm nay" value={stats.todayIn} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Xuất hôm nay" value={stats.todayOut} />
        </Grid>
      </Grid>
    </>
  );
}

export default Dashboard;
