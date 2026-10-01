import { useEffect, useState } from "react";
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
} from "@mui/material";

function Inventory() {
  const [inventory, setInventory] = useState([]);

  const fetchInventory = () => {
    fetch("http://localhost:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data))
      .catch((err) =>
        console.error("Lỗi tải tồn kho:", err)
      );
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Hết hàng") {
      return "error";
    }

    if (status === "Sắp hết") {
      return "warning";
    }

    return "success";
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">
          Tồn kho
        </Typography>
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
            {inventory.map((item) => (
              <TableRow key={item.inventory_id}>
                <TableCell>
                  {item.product_code}
                </TableCell>

                <TableCell>
                  {item.product_name}
                </TableCell>

                <TableCell>
                  {item.warehouse_name}
                </TableCell>

                <TableCell>
                  {item.unit}
                </TableCell>

                <TableCell>
                  {item.stock}
                </TableCell>

                <TableCell>
                  {item.min_stock}
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.stock_status}
                    color={getStatusColor(
                      item.stock_status
                    )}
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