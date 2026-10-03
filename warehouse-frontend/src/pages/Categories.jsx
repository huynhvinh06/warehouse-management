import { canEditCatalog } from "../utils/api";
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
} from "@mui/material";

function Categories() {
  const canEdit = canEditCatalog();

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category_name: "",
    description: "",
  });

  // Lấy danh sách danh mục
  const fetchCategories = () => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) =>
        console.error("Lỗi tải danh mục:", err)
      );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Thay đổi form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Mở form thêm
  const handleOpenAdd = () => {
    setEditingId(null);

    setForm({
      category_name: "",
      description: "",
    });

    setOpen(true);
  };

  // Mở form sửa
  const handleOpenEdit = (category) => {
    setEditingId(category.category_id);

    setForm({
      category_name: category.category_name,
      description: category.description || "",
    });

    setOpen(true);
  };

  // Đóng form
  const handleClose = () => {
    setOpen(false);
  };

  // Thêm / sửa danh mục
  const handleSubmit = async () => {
    try {
      const url = editingId
        ? `http://localhost:5000/api/categories/${editingId}`
        : "http://localhost:5000/api/categories";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể thực hiện thao tác"
        );
      }

      alert(
        editingId
          ? "Cập nhật danh mục thành công!"
          : "Thêm danh mục thành công!"
      );

      setOpen(false);
      fetchCategories();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Xóa danh mục
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể xóa danh mục"
        );
      }

      alert("Xóa danh mục thành công!");
      fetchCategories();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <>
      {/* Tiêu đề + nút thêm */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4">
          Danh mục
        </Typography>

        {canEdit && (
          <Button
          variant="contained"
          onClick={handleOpenAdd}
        >
          + Thêm danh mục
        </Button>
        )}
      </Box>

      {/* Bảng danh mục */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã danh mục</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              {canEdit && <TableCell>Hành động</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell>
                  {category.category_id}
                </TableCell>

                <TableCell>
                  {category.category_name}
                </TableCell>

                <TableCell>
                  {category.description}
                </TableCell>

                {canEdit && (
                <TableCell>
                  <Button
                    size="small"
                    onClick={() =>
                      handleOpenEdit(category)
                    }
                  >
                    Sửa
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      handleDelete(category.category_id)
                    }
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

      {/* Form */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId
            ? "Sửa danh mục"
            : "Thêm danh mục"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Tên danh mục"
            name="category_name"
            value={form.category_name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Mô tả"
            name="description"
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {editingId ? "Lưu thay đổi" : "Thêm danh mục"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Categories;