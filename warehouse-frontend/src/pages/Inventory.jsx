import { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Box,
  Chip,
  TextField,
  MenuItem,
} from "@mui/material";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchInventory = () => {
    fetch("http://localhost:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải tồn kho:", err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusColor = (stockStatus) => {
    if (stockStatus === "Hết hàng") return "error";
    if (stockStatus === "Sắp hết") return "warning";
    return "success";
  };

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    return inventory.filter(
      (item) =>
        (!status || item.stock_status === status) &&
        (!k ||
          item.product_code.toLowerCase().includes(k) ||
          item.product_name.toLowerCase().includes(k))
    );
  }, [inventory, search, status]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Tồn kho</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Tìm theo mã hoặc tên sản phẩm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        <TextField
          select
          size="small"
          label="Trạng thái"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 180 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="Đủ hàng">Đủ hàng</MenuItem>
          <MenuItem value="Sắp hết">Sắp hết</MenuItem>
          <MenuItem value="Hết hàng">Hết hàng</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Kho</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell>Số lượng tồn</TableCell>
              <TableCell>Tồn tối thiểu</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có dữ liệu tồn kho
                </TableCell>
              </TableRow>
            )}

            {filtered.map((item) => (
              <TableRow key={`${item.warehouse_id}-${item.product_id}`}>
                <TableCell>{item.product_code}</TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.warehouse_name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.min_stock}</TableCell>
                <TableCell>
                  <Chip
                    label={item.stock_status}
                    color={getStatusColor(item.stock_status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Inventory;
