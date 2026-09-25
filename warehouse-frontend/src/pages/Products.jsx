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
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    product_code: "",
    product_name: "",
    category_id: 1,
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Thay đổi dữ liệu form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Mở form
  const handleOpen = () => {
    setOpen(true);
  };

  // Đóng form
  const handleClose = () => {
    setOpen(false);
  };

  // Thêm sản phẩm
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
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
        throw new Error(data.message || "Không thể thêm sản phẩm");
      }

      alert("Thêm sản phẩm thành công!");

      setForm({
        product_code: "",
        product_name: "",
        category_id: 1,
        unit: "",
        import_price: "",
        selling_price: "",
        min_stock: "",
      });

      setOpen(false);

      // Tải lại danh sách sản phẩm
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

        <Button variant="contained" onClick={handleOpen}>
          + Thêm sản phẩm
        </Button>
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
              <TableCell>Hành động</TableCell>
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
                <TableCell>
                  <Button size="small">Sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form thêm sản phẩm */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Thêm sản phẩm</DialogTitle>

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
          >
            <MenuItem value={1}>Đồ uống</MenuItem>
            <MenuItem value={2}>Thực phẩm</MenuItem>
            <MenuItem value={3}>Đồ gia dụng</MenuItem>
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
            Thêm sản phẩm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Products;