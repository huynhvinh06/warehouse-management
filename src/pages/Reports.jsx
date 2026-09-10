import { useState } from "react";
import { Typography, TextField, Button, Box, Grid } from "@mui/material";
import StatCard from "../components/StatCard";

function Reports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [report, setReport] = useState({
    openingStock: 0,
    totalIn: 0,
    totalOut: 0,
    closingStock: 0,
  });

  const handleGenerate = () => {
    fetch(`/api/reports/inventory?from=${fromDate}&to=${toDate}`)
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Lỗi tạo báo cáo:", err));
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Báo cáo Nhập - Xuất - Tồn
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
        <TextField
          label="Từ ngày"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          label="Đến ngày"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button variant="contained" onClick={handleGenerate}>
          Xem báo cáo
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tồn đầu kỳ" value={report.openingStock} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tổng nhập" value={report.totalIn} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tổng xuất" value={report.totalOut} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Tồn cuối kỳ" value={report.closingStock} />
        </Grid>
      </Grid>
    </>
  );
}

export default Reports;
