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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  API_URL,
  getCurrentUserId,
  STATUS_LABELS,
  formatDateTime,
  formatMoney,
  canCreateReceipt,
} from "../utils/api";

const emptyItem = { product_id: "", quantity: "" };

function Exports() {
  const [exportsList, setExportsList] = useState([]);
  const [products, setProducts] = useState([]);

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);

  const fetchExports = () => {
    fetch(`${API_URL}/api/exports`)
      .then((res) => res.json())
      .then((data) => setExportsList(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải phiếu xuất:", err));
  };

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải sản phẩm:", err));
  };

  useEffect(() => {
    fetchExports();
    fetchProducts();
  }, []);

  const handleOpen = () => {
    fetchProducts(); // cập nhật tồn mới nhất để hiển thị
    setNote("");
    setItems([{ ...emptyItem }]);
    setError("");
    setOpen(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const getProduct = (id) => products.find((p) => p.product_id === Number(id));

  const handleSubmit = async () => {
    if (items.some((it) => !it.product_id))
      return setError("Vui lòng chọn ít nhất một sản phẩm");
    if (items.some((it) => !(Number(it.quantity) > 0)))
      return setError("Số lượng xuất phải lớn hơn 0");

    // Kiểm tra nhanh phía giao diện; máy chủ vẫn kiểm tra lại khi lưu phiếu
    for (const it of items) {
      const p = getProduct(it.product_id);
      if (p && Number(it.quantity) > p.stock) {
        return setError(
          `Số lượng tồn kho không đủ để xuất: ${p.product_name} (tồn ${p.stock})`
        );
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: getCurrentUserId(),
          note,
          items: items.map((it) => ({
            product_id: Number(it.product_id),
            quantity: Number(it.quantity),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể lập phiếu xuất");
        return;
      }

      setOpen(false);
      fetchExports();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    }
  };

  const handleViewDetail = (id) => {
    fetch(`${API_URL}/api/exports/${id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .catch((err) => console.error("Lỗi tải chi tiết phiếu xuất:", err));
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Phiếu xuất kho</Typography>
        {canCreateReceipt() && (
          <Button variant="contained" onClick={handleOpen}>
            + Tạo phiếu xuất
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Ngày xuất</TableCell>
              <TableCell>Khách hàng / Lý do</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exportsList.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.code}</TableCell>
                <TableCell>{formatDateTime(e.date)}</TableCell>
                <TableCell>{e.customer}</TableCell>
                <TableCell>{e.quantity}</TableCell>
                <TableCell>{formatMoney(e.total_amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[e.status] || e.status}
                    color={e.status === "APPROVED" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleViewDetail(e.id)}>
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form lập phiếu xuất */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lập phiếu xuất kho</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Khách hàng / Lý do xuất"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          />

          {items.map((it, index) => {
            const p = getProduct(it.product_id);
            return (
              <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  select
                  label="Sản phẩm"
                  value={it.product_id}
                  onChange={(e) => updateItem(index, "product_id", e.target.value)}
                  sx={{ flex: 2 }}
                >
                  {products.map((pr) => (
                    <MenuItem key={pr.product_id} value={pr.product_id}>
                      {pr.product_code} - {pr.product_name} (tồn {pr.stock})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Số lượng xuất"
                  type="number"
                  value={it.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  error={!!p && Number(it.quantity) > p.stock}
                  helperText={p ? `Tồn hiện có: ${p.stock} ${p.unit}` : ""}
                  sx={{ flex: 1 }}
                />

                <IconButton
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            );
          })}

          <Button onClick={() => setItems([...items, { ...emptyItem }])}>
            + Thêm sản phẩm
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Hoàn tất phiếu xuất
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chi tiết phiếu xuất */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết phiếu {detail?.export_code}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Khách hàng / Lý do: {detail?.note}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn giá</TableCell>
                <TableCell>Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail?.items?.map((it) => (
                <TableRow key={it.product_id}>
                  <TableCell>{it.product_name}</TableCell>
                  <TableCell>
                    {it.quantity} {it.unit}
                  </TableCell>
                  <TableCell>{formatMoney(it.unit_price)}</TableCell>
                  <TableCell>{formatMoney(it.total_price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Exports;
