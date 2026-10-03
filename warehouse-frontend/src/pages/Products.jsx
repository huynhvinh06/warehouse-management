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
  MenuItem,
} from "@mui/material";

function Products() {
  const canEdit = canEditCatalog();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);

  // null = thêm sản phẩm
  // có id = sửa sản phẩm
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_code: "",
    product_name: "",
    category_id: "",
    unit: "",
    import_price: "",
    selling_price: "",
    min_stock: "",
  });

  // Lấy danh sách sản phẩm
  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi tải sản phẩm:", err));
  };

  // Lấy danh sách danh mục từ CSDL (không viết cứng trong code)
  const fetchCategories = () =>
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        return list;
      })
      .catch((err) => {
        console.error("Lỗi tải danh mục:", err);
        return [];
      });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      product_code: "",
      product_name: "",
      category_id: "",
      unit: "",
      import_price: "",
      selling_price: "",
      min_stock: "",
    });
  };

  // Mở form thêm
  const handleOpenAdd = async () => {
    // Tải lại danh mục để thấy ngay danh mục vừa thêm, mặc định chọn danh mục đầu tiên
    const list = await fetchCategories();

    setEditingId(null);
    resetForm();
    setForm((prev) => ({ ...prev, category_id: list[0]?.category_id ?? "" }));
    setOpen(true);
  };

  // Mở form sửa
  const handleOpenEdit = (product) => {
    fetchCategories();
    setEditingId(product.product_id);

    setForm({
      product_code: product.product_code,
      product_name: product.product_name,
      category_id: product.category_id ?? "",
      unit: product.unit,
      import_price: product.import_price,
      selling_price: product.selling_price,
      min_stock: product.min_stock,
    });

    setOpen(true);
  };

  // Đóng form
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    resetForm();
  };

  // Thêm hoặc sửa sản phẩm
  const handleSubmit = async () => {
    if (!form.category_id) {
      alert("Vui lòng chọn danh mục cho sản phẩm");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          import_price: Number(form.import_price),
          selling_price: Number(form.selling_price),
          min_stock: Number(form.min_stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingId
              ? "Không thể cập nhật sản phẩm"
              : "Không thể thêm sản phẩm")
        );
      }

      alert(
        editingId
          ? "Cập nhật sản phẩm thành công!"
          : "Thêm sản phẩm thành công!"
      );

      handleClose();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn xóa sản phẩm này không?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa sản phẩm");
    }

    alert("Xóa sản phẩm thành công!");
    fetchProducts();
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
        <Typography variant="h4">Sản phẩm</Typography>

        {canEdit && (
          <Button variant="contained" onClick={handleOpenAdd}>
          + Thêm sản phẩm
        </Button>
        )}
      </Box>

      {/* Bảng sản phẩm */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Đơn vị tính</TableCell>
              <TableCell>Tồn tối thiểu</TableCell>
              {canEdit && <TableCell>Hành động</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow key={p.product_id}>
                <TableCell>{p.product_code}</TableCell>
                <TableCell>{p.product_name}</TableCell>
                <TableCell>{p.category_name}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell>{p.min_stock}</TableCell>

                {canEdit && (
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenEdit(p)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(p.product_id)}
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

      {/* Form thêm / sửa sản phẩm */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Mã sản phẩm"
            name="product_code"
            value={form.product_code}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Tên sản phẩm"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
          />

          <TextField
            select
            fullWidth
            margin="normal"
            label="Danh mục"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            error={categories.length === 0}
            helperText={
              categories.length === 0
                ? "Chưa có danh mục nào, vui lòng thêm danh mục trước"
                : ""
            }
          >
            {categories.map((c) => (
              <MenuItem key={c.category_id} value={c.category_id}>
                {c.category_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            margin="normal"
            label="Đơn vị tính"
            name="unit"
            placeholder="Ví dụ: Lon, Chai, Gói"
            value={form.unit}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Giá nhập"
            name="import_price"
            type="number"
            value={form.import_price}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Giá bán"
            name="selling_price"
            type="number"
            value={form.selling_price}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Tồn tối thiểu"
            name="min_stock"
            type="number"
            value={form.min_stock}
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
            {editingId ? "Cập nhật" : "Thêm sản phẩm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Products;