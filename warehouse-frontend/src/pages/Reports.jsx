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

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      alert("Vui lòng chọn đầy đủ từ ngày và đến ngày!");
      return;
    }

    if (fromDate > toDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }

    try {
      const res = await fetch(
        `/api/reports/inventory?from=${fromDate}&to=${toDate}`
      );

      if (!res.ok) {
        throw new Error("Không thể lấy dữ liệu báo cáo");
      }

      const data = await res.json();

      setReport({
        openingStock: data.openingStock ?? 0,
        totalIn: data.totalIn ?? 0,
        totalOut: data.totalOut ?? 0,
        closingStock: data.closingStock ?? 0,
      });
    } catch (err) {
      console.error("Lỗi tạo báo cáo:", err);
      alert("Không thể tải báo cáo!");
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Báo cáo Nhập - Xuất - Tồn
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Từ ngày"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ minWidth: 240 }}
        />

        <TextField
          label="Đến ngày"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ minWidth: 240 }}
        />

        <Button
          variant="contained"
          onClick={handleGenerate}
          sx={{ height: 56 }}
        >
          Xem báo cáo
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Tồn đầu kỳ"
            value={report.openingStock}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Tổng nhập"
            value={report.totalIn}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Tổng xuất"
            value={report.totalOut}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Tồn cuối kỳ"
            value={report.closingStock}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default Reports;