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

const emptyForm = {
  supplier_code: "",
  supplier_name: "",
  phone: "",
  email: "",
  address: "",
};

function Suppliers() {
  const canEdit = canEditCatalog();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Lấy danh sách (có tìm kiếm theo mã / tên)
  const fetchSuppliers = (keyword = "") => {
    fetch(`${API_URL}/api/suppliers?q=${encodeURIComponent(keyword)}`)
      .then((res) => res.json())
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải nhà cung cấp:", err));
  };

  // Tìm kiếm sau khi người dùng ngừng gõ một chút, tránh gọi API mỗi phím
  useEffect(() => {
    const timer = setTimeout(() => fetchSuppliers(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.supplier_id);
    setForm({
      supplier_code: s.supplier_code,
      supplier_name: s.supplier_name,
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
    });
    setError("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const validate = () => {
    if (!form.supplier_code.trim() || !form.supplier_name.trim()) {
      return "Mã và tên nhà cung cấp không được để trống";
    }
    if (form.phone && !/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) {
      return "Số điện thoại không hợp lệ";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const handleSubmit = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/api/suppliers/${editingId}`
        : `${API_URL}/api/suppliers`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Không thể thực hiện thao tác");
        return;
      }

      setOpen(false);
      fetchSuppliers(search.trim());
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${s.supplier_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/suppliers/${s.supplier_id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Không thể xóa nhà cung cấp");
        return;
      }

      fetchSuppliers(search.trim());
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến máy chủ");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Nhà cung cấp</Typography>

        {canEdit && (
          <Button variant="contained" onClick={handleOpenAdd}>
            + Thêm nhà cung cấp
          </Button>
        )}
      </Box>

      <TextField
        size="small"
        placeholder="Tìm theo mã hoặc tên nhà cung cấp"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 360 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã NCC</TableCell>
              <TableCell>Tên nhà cung cấp</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Địa chỉ</TableCell>
              {canEdit && <TableCell>Hành động</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} align="center">
                  Không có nhà cung cấp nào
                </TableCell>
              </TableRow>
            )}

            {suppliers.map((s) => (
              <TableRow key={s.supplier_id}>
                <TableCell>{s.supplier_code}</TableCell>
                <TableCell>{s.supplier_name}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.address}</TableCell>

                {canEdit && (
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenEdit(s)}>
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(s)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form thêm / sửa */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Mã nhà cung cấp"
            name="supplier_code"
            value={form.supplier_code}
            onChange={handleChange}
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Tên nhà cung cấp"
            name="supplier_name"
            value={form.supplier_name}
            onChange={handleChange}
            slotProps={{ htmlInput: { maxLength: 150 } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Địa chỉ"
            name="address"
            multiline
            rows={2}
            value={form.address}
            onChange={handleChange}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? "Lưu thay đổi" : "Thêm nhà cung cấp"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Suppliers;
