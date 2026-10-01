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
  Chip,
} from "@mui/material";

function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    phone: "",
    email: "",
    role_id: 3,
    status: 1,
  });

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Lỗi tải tài khoản:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      full_name: "",
      phone: "",
      email: "",
      role_id: 3,
      status: 1,
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.user_id);

    setForm({
      username: user.username,
      password: "",
      full_name: user.full_name,
      phone: user.phone || "",
      email: user.email || "",
      role_id: user.role_id,
      status: user.status,
    });

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      const url = editingId
        ? `http://localhost:5000/api/users/${editingId}`
        : "http://localhost:5000/api/users";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          role_id: Number(form.role_id),
          status: Number(form.status),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingId
              ? "Không thể cập nhật tài khoản"
              : "Không thể thêm tài khoản")
        );
      }

      alert(
        editingId
          ? "Cập nhật tài khoản thành công!"
          : "Thêm tài khoản thành công!"
      );

      handleClose();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này không?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể xóa tài khoản");
      }

      alert("Xóa tài khoản thành công!");
      fetchUsers();
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
          Quản lý tài khoản
        </Typography>

        <Button variant="contained" onClick={handleOpenAdd}>
          + Thêm tài khoản
        </Button>
      </Box>

      {/* Bảng tài khoản */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Chip
                    label={user.role_name}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      Number(user.status) === 1
                        ? "Hoạt động"
                        : "Khóa"
                    }
                    color={
                      Number(user.status) === 1
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenEdit(user)}
                  >
                    Sửa
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form thêm / sửa */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId
            ? "Sửa tài khoản"
            : "Thêm tài khoản"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Tên đăng nhập"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label={
              editingId
                ? "Mật khẩu mới (để trống nếu không đổi)"
                : "Mật khẩu"
            }
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Họ và tên"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            select
            fullWidth
            margin="normal"
            label="Vai trò"
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
          >
            <MenuItem value={1}>ADMIN</MenuItem>
            <MenuItem value={2}>MANAGER</MenuItem>
            <MenuItem value={3}>STAFF</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            margin="normal"
            label="Trạng thái"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <MenuItem value={1}>Hoạt động</MenuItem>
            <MenuItem value={0}>Khóa</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            {editingId ? "Lưu thay đổi" : "Thêm tài khoản"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Users;
