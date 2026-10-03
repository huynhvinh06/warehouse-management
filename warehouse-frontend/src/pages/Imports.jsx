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

const emptyItem = { product_id: "", quantity: "", unit_price: "" };

function Imports() {
  const [imports, setImports] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);

  const fetchImports = () => {
    fetch(`${API_URL}/api/imports`)
      .then((res) => res.json())
      .then((data) => setImports(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải phiếu nhập:", err));
  };

  useEffect(() => {
    fetchImports();

    fetch(`${API_URL}/api/suppliers`)
      .then((res) => res.json())
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải nhà cung cấp:", err));

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải sản phẩm:", err));
  }, []);

  const handleOpen = () => {
    setSupplierId("");
    setNote("");
    setItems([{ ...emptyItem }]);
    setError("");
    setOpen(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const next = { ...it, [field]: value };
        // Chọn sản phẩm thì gợi ý sẵn giá nhập tham khảo
        if (field === "product_id") {
          const p = products.find((x) => x.product_id === Number(value));
          if (p && !it.unit_price) next.unit_price = p.import_price;
        }
        return next;
      })
    );
  };

  const total = items.reduce(
    (sum, it) => sum + Number(it.quantity || 0) * Number(it.unit_price || 0),
    0
  );

  const handleSubmit = async () => {
    if (!supplierId) return setError("Vui lòng chọn nhà cung cấp");
    if (items.some((it) => !it.product_id))
      return setError("Vui lòng chọn ít nhất một sản phẩm");
    if (items.some((it) => !(Number(it.quantity) > 0) || !(Number(it.unit_price) > 0)))
      return setError("Số lượng và đơn giá phải lớn hơn 0");

    try {
      const res = await fetch(`${API_URL}/api/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: Number(supplierId),
          user_id: getCurrentUserId(),
          note,
          items: items.map((it) => ({
            product_id: Number(it.product_id),
            quantity: Number(it.quantity),
            unit_price: Number(it.unit_price),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể lập phiếu nhập");
        return;
      }

      setOpen(false);
      fetchImports();
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    }
  };

  const handleViewDetail = (id) => {
    fetch(`${API_URL}/api/imports/${id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .catch((err) => console.error("Lỗi tải chi tiết phiếu nhập:", err));
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Phiếu nhập kho</Typography>
        {canCreateReceipt() && (
          <Button variant="contained" onClick={handleOpen}>
            + Tạo phiếu nhập
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Ngày nhập</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {imports.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.code}</TableCell>
                <TableCell>{formatDateTime(i.date)}</TableCell>
                <TableCell>{i.supplier}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>{formatMoney(i.total_amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[i.status] || i.status}
                    color={i.status === "APPROVED" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleViewDetail(i.id)}>
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form lập phiếu nhập */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lập phiếu nhập kho</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 2 }}>
            <TextField
              select
              label="Nhà cung cấp"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              sx={{ minWidth: 280 }}
            >
              {suppliers.map((s) => (
                <MenuItem key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
            />
          </Box>

          {items.map((it, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                select
                label="Sản phẩm"
                value={it.product_id}
                onChange={(e) => updateItem(index, "product_id", e.target.value)}
                sx={{ flex: 2 }}
              >
                {products.map((p) => (
                  <MenuItem key={p.product_id} value={p.product_id}>
                    {p.product_code} - {p.product_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Số lượng"
                type="number"
                value={it.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Đơn giá"
                type="number"
                value={it.unit_price}
                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                sx={{ flex: 1 }}
              />

              <IconButton
                onClick={() => setItems(items.filter((_, i) => i !== index))}
                disabled={items.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button onClick={() => setItems([...items, { ...emptyItem }])}>
            + Thêm sản phẩm
          </Button>

          <Typography variant="h6" sx={{ mt: 2, textAlign: "right" }}>
            Tổng tiền: {formatMoney(total)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu phiếu nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chi tiết phiếu nhập */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết phiếu {detail?.import_code}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Nhà cung cấp: {detail?.supplier_name}
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

export default Imports;
