import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
} from "@mui/material";
import StatCard from "../components/StatCard";

function Reports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [report, setReport] = useState({
    openingStock: 0,
    totalIn: 0,
    totalOut: 0,
    totalAdjust: 0,
    closingStock: 0,
  });

  const [details, setDetails] = useState([]);

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
        `http://localhost:5000/api/reports/inventory?from=${fromDate}&to=${toDate}`
      );

      if (!res.ok) {
        throw new Error("Không thể lấy dữ liệu báo cáo");
      }

      const data = await res.json();

      setReport({
        openingStock: data.openingStock ?? 0,
        totalIn: data.totalIn ?? 0,
        totalOut: data.totalOut ?? 0,
        totalAdjust: data.totalAdjust ?? 0,
        closingStock: data.closingStock ?? 0,
      });
      setDetails(data.details ?? []);
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

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <Box>
          <StatCard
            label="Tồn đầu kỳ"
            color="primary"
            value={report.openingStock}
          />
        </Box>

        <Box>
          <StatCard
            label="Tổng nhập"
            color="success"
            value={report.totalIn}
          />
        </Box>

        <Box>
          <StatCard
            label="Tổng xuất"
            color="info"
            value={report.totalOut}
          />
        </Box>

        <Box>
          <StatCard
            label="Điều chỉnh kiểm kê"
            color="warning"
            value={report.totalAdjust}
          />
        </Box>

        <Box>
          <StatCard
            label="Tồn cuối kỳ"
            color="primary"
            value={report.closingStock}
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell align="right">Tồn đầu kỳ</TableCell>
              <TableCell align="right">Nhập</TableCell>
              <TableCell align="right">Xuất</TableCell>
              <TableCell align="right">Điều chỉnh KK</TableCell>
              <TableCell align="right">Tồn cuối kỳ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.map((d) => (
              <TableRow key={d.product_id}>
                <TableCell>{d.product_code}</TableCell>
                <TableCell>{d.product_name}</TableCell>
                <TableCell align="right">{d.openingStock}</TableCell>
                <TableCell align="right">{d.totalIn}</TableCell>
                <TableCell align="right">{d.totalOut}</TableCell>
                <TableCell align="right">{d.adjustment}</TableCell>
                <TableCell align="right">{d.closingStock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Reports;