import { useEffect, useMemo, useState } from "react";
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
  Alert,
} from "@mui/material";
import {
  API_URL,
  canCreateReceipt,
  formatDateTime,
} from "../utils/api";

const STATUS_LABELS = {
  DRAFT: "Nháp",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

function diffColor(d) {
  if (d > 0) return "success.main";
  if (d < 0) return "error.main";
  return "text.secondary";
}

function formatDiff(d) {
  return d > 0 ? `+${d}` : String(d);
}

function Stocktakes() {
  const canCreate = canCreateReceipt();

  const [stocktakes, setStocktakes] = useState([]);

  // Form kiểm kê
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState([]); // sản phẩm + số lượng hệ thống
  const [actuals, setActuals] = useState({}); // product_id -> chuỗi số lượng thực tế
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Chi tiết phiếu
  const [detail, setDetail] = useState(null);

  const fetchStocktakes = () => {
    fetch(`${API_URL}/api/stocktakes`)
      .then((res) => res.json())
      .then((data) => setStocktakes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải phiếu kiểm kê:", err));
  };

  useEffect(() => {
    fetchStocktakes();
  }, []);

  // Bước 1-2 của UC12: mở bảng kiểm kê với số lượng trên hệ thống
  const handleOpen = async () => {
    setError("");
    setNote("");
    setSearch("");
    setActuals({});

    try {
      const res = await fetch(`${API_URL}/api/stocktakes/sheet`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSheet(data);
      setOpen(true);
    } catch (err) {
      console.error(err);
      alert("Không thể tải dữ liệu kiểm kê, vui lòng thử lại");
    }
  };

  // A1: hủy thao tác, không lưu gì
  const handleCancel = () => {
    setOpen(false);
    setActuals({});
  };

  const setActual = (productId, value) => {
    setActuals((prev) => ({ ...prev, [productId]: value }));
  };

  // Giá trị hợp lệ: số nguyên không âm
  const parseActual = (value) => {
    if (value === undefined || String(value).trim() === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 ? n : NaN;
  };

  const filteredSheet = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return sheet;
    return sheet.filter(
      (p) =>
        p.product_code.toLowerCase().includes(k) ||
        p.product_name.toLowerCase().includes(k)
    );
  }, [sheet, search]);

  const handleSubmit = async () => {
    setError("");

    // E1: chưa nhập đủ
    if (sheet.some((p) => parseActual(actuals[p.product_id]) === null)) {
      setError("Vui lòng nhập đầy đủ số lượng thực tế");
      return;
    }
    // E2: không hợp lệ
    if (sheet.some((p) => Number.isNaN(parseActual(actuals[p.product_id])))) {
      setError("Số lượng thực tế không hợp lệ");
      return;
    }

    const diffLines = sheet.filter(
      (p) => parseActual(actuals[p.product_id]) !== p.system_quantity
    ).length;

    if (
      !window.confirm(
        `Xác nhận kiểm kê? Có ${diffLines} sản phẩm chênh lệch. Tồn kho sẽ được cập nhật theo số lượng thực tế và không thể hoàn tác.`
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/stocktakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          items: sheet.map((p) => ({
            product_id: p.product_id,
            actual_quantity: parseActual(actuals[p.product_id]),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể lưu phiếu kiểm kê, vui lòng thử lại");
        return;
      }

      setOpen(false);
      fetchStocktakes();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu phiếu kiểm kê, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetail = (id) => {
    fetch(`${API_URL}/api/stocktakes/${id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .catch((err) => console.error("Lỗi tải chi tiết phiếu kiểm kê:", err));
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Kiểm kê kho hàng</Typography>

        {canCreate && (
          <Button variant="contained" onClick={handleOpen}>
            + Kiểm kê mới
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã phiếu</TableCell>
              <TableCell>Ngày kiểm kê</TableCell>
              <TableCell>Người thực hiện</TableCell>
              <TableCell>Số sản phẩm</TableCell>
              <TableCell>Số dòng chênh lệch</TableCell>
              <TableCell>Tổng chênh lệch</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stocktakes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chưa có phiếu kiểm kê nào
                </TableCell>
              </TableRow>
            )}

            {stocktakes.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.code}</TableCell>
                <TableCell>{formatDateTime(s.date)}</TableCell>
                <TableCell>{s.user_name}</TableCell>
                <TableCell>{s.item_count}</TableCell>
                <TableCell>{Number(s.diff_lines)}</TableCell>
                <TableCell sx={{ color: diffColor(Number(s.net_difference)) }}>
                  {formatDiff(Number(s.net_difference))}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={STATUS_LABELS[s.status] || s.status}
                    color={s.status === "COMPLETED" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleViewDetail(s.id)}>
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form kiểm kê */}
      <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
        <DialogTitle>Kiểm kê kho hàng</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Tìm sản phẩm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 280 }}
            />
            <TextField
              size="small"
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 255 } }}
              fullWidth
            />
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã SP</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>ĐVT</TableCell>
                <TableCell align="right">Số lượng hệ thống</TableCell>
                <TableCell sx={{ width: 180 }}>Số lượng thực tế</TableCell>
                <TableCell align="right">Chênh lệch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSheet.map((p) => {
                const parsed = parseActual(actuals[p.product_id]);
                const valid = parsed !== null && !Number.isNaN(parsed);
                const diff = valid ? parsed - p.system_quantity : null;

                return (
                  <TableRow key={p.product_id}>
                    <TableCell>{p.product_code}</TableCell>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell align="right">{p.system_quantity}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={actuals[p.product_id] ?? ""}
                        onChange={(e) => setActual(p.product_id, e.target.value)}
                        error={Number.isNaN(parsed)}
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: valid ? diffColor(diff) : "text.secondary" }}
                    >
                      {valid ? formatDiff(diff) : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            Xác nhận kiểm kê
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chi tiết phiếu kiểm kê */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết phiếu {detail?.stocktake_code}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Người thực hiện: {detail?.user_name}
            {detail?.note ? ` — Ghi chú: ${detail.note}` : ""}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="right">Hệ thống</TableCell>
                <TableCell align="right">Thực tế</TableCell>
                <TableCell align="right">Chênh lệch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detail?.items?.map((it) => (
                <TableRow key={it.product_id}>
                  <TableCell>
                    {it.product_code} - {it.product_name}
                  </TableCell>
                  <TableCell align="right">{it.system_quantity}</TableCell>
                  <TableCell align="right">{it.actual_quantity}</TableCell>
                  <TableCell align="right" sx={{ color: diffColor(it.difference) }}>
                    {formatDiff(it.difference)}
                  </TableCell>
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

export default Stocktakes;
