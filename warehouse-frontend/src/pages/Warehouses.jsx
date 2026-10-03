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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import { API_URL, canEditCatalog } from "../utils/api";

function Warehouses() {
  const canEdit = canEditCatalog();

  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ warehouse_name: "", address: "" });
  const [error, setError] = useState("");

  const fetchWarehouses = () => {
    fetch(`${API_URL}/api/warehouses`)
      .then((res) => res.json())
      .then((data) => setWarehouses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải kho hàng:", err));
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenEdit = (w) => {
    setEditingId(w.warehouse_id);
    setForm({ warehouse_name: w.warehouse_name, address: w.address || "" });
    setError("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.warehouse_name.trim()) {
      setError("Tên kho không được để trống");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/warehouses/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể cập nhật kho");
        return;
      }

      setOpen(false);
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    }
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Thông tin kho</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã kho</TableCell>
              <TableCell>Tên kho</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số loại SP</TableCell>
              {canEdit && <TableCell>Hành động</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.length === 0 && (
              <TableRow>
                <TableCell colSpan={canEdit ? 5 : 4} align="center">
                  Không có kho nào
                </TableCell>
              </TableRow>
            )}

            {warehouses.map((w) => (
              <TableRow key={w.warehouse_id}>
                <TableCell>{w.warehouse_id}</TableCell>
                <TableCell>{w.warehouse_name}</TableCell>
                <TableCell>{w.address}</TableCell>
                <TableCell>{w.productCount}</TableCell>
                {canEdit && (
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenEdit(w)}>
                      Sửa
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa thông tin kho</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Tên kho"
            value={form.warehouse_name}
            onChange={(e) => setForm({ ...form, warehouse_name: e.target.value })}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Warehouses;
