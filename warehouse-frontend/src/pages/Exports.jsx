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

function Exports() {
  const [exportsList, setExportsList] = useState([]);

  useEffect(() => {
    fetch("/api/exports")
      .then((res) => res.json())
      .then((data) => setExportsList(data))
      .catch((err) => console.error("Lỗi tải phiếu xuất:", err));
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Phiếu xuất kho</Typography>
        <Button variant="contained">+ Tạo phiếu xuất</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Ngày xuất</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exportsList.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.code}</TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.customer}</TableCell>
                <TableCell>{e.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={e.status}
                    color={e.status === "Hoàn thành" ? "success" : "warning"}
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

export default Exports;
