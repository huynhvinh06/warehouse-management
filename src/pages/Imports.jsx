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
  Chip,
} from "@mui/material";

function Imports() {
  const [imports, setImports] = useState([]);

  useEffect(() => {
    fetch("/api/imports")
      .then((res) => res.json())
      .then((data) => setImports(data))
      .catch((err) => console.error("Lỗi tải phiếu nhập:", err));
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Phiếu nhập kho</Typography>
        <Button variant="contained">+ Tạo phiếu nhập</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Ngày nhập</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {imports.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.code}</TableCell>
                <TableCell>{i.date}</TableCell>
                <TableCell>{i.supplier}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={i.status}
                    color={i.status === "Hoàn thành" ? "success" : "warning"}
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

export default Imports;
