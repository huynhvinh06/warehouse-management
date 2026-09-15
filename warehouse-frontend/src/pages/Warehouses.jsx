import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Box,
} from "@mui/material";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((data) => setWarehouses(data))
      .catch((err) => console.error("Lỗi tải kho hàng:", err));
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Kho hàng</Typography>
        <Button variant="contained">+ Thêm kho</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã kho</TableCell>
              <TableCell>Tên kho</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số loại SP</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.code}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.address}</TableCell>
                <TableCell>{w.productCount}</TableCell>
                <TableCell>
                  <Button size="small">Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Warehouses;
