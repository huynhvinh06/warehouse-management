import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  TableContainer,
  Box,
  Chip,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import { API_URL, formatDateTime } from "../utils/api";

// Nhãn tiếng Việt cho các mã hành động ghi trong audit_logs
const ACTION_LABELS = {
  LOGIN: "Đăng nhập",
  IMPORT_CREATE: "Lập phiếu nhập",
  EXPORT_CREATE: "Lập phiếu xuất",
  STOCKTAKE_CREATE: "Lập phiếu kiểm kê",
  PRODUCT_CREATE: "Thêm sản phẩm",
  PRODUCT_UPDATE: "Sửa sản phẩm",
  PRODUCT_DELETE: "Xóa sản phẩm",
  CATEGORY_CREATE: "Thêm danh mục",
  CATEGORY_UPDATE: "Sửa danh mục",
  CATEGORY_DELETE: "Xóa danh mục",
  WAREHOUSE_UPDATE: "Sửa thông tin kho",
  SUPPLIER_CREATE: "Thêm nhà cung cấp",
  SUPPLIER_UPDATE: "Sửa nhà cung cấp",
  SUPPLIER_DELETE: "Xóa nhà cung cấp",
  USER_CREATE: "Tạo tài khoản",
  USER_UPDATE: "Sửa tài khoản",
  USER_DELETE: "Xóa tài khoản",
  ROLE_CHANGE: "Đổi vai trò",
};

function actionColor(action) {
  if (action.endsWith("_DELETE")) return "error";
  if (action.endsWith("_CREATE")) return "success";
  if (action === "ROLE_CHANGE") return "warning";
  return "default";
}

const emptyFilters = { from: "", to: "", q: "", action: "" };

function AuditLogs() {
  const [filters, setFilters] = useState(emptyFilters); // giá trị đang nhập
  const [applied, setApplied] = useState(emptyFilters); // giá trị đang áp dụng
  const [actions, setActions] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // MUI đếm từ 0
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/audit-logs/actions`)
      .then((res) => res.json())
      .then((data) => setActions(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải danh sách hành động:", err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page: page + 1, limit });
    Object.entries(applied).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/audit-logs?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
      })
      .then((data) => {
        setRows(data.rows);
        setTotal(data.total);
      })
      .catch((err) => {
        console.error("Lỗi tải nhật ký:", err);
        // Không hiển thị dữ liệu chưa đầy đủ
        setRows([]);
        setTotal(0);
        setError(err.message || "Không thể tải nhật ký thao tác, vui lòng thử lại");
      })
      .finally(() => setLoading(false));
  }, [applied, page, limit]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    if (filters.from && filters.to && filters.from > filters.to) {
      setError("Khoảng thời gian không hợp lệ");
      return;
    }
    setPage(0);
    setApplied({ ...filters, q: filters.q.trim() });
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setPage(0);
  };

  const hasFilter = Object.values(applied).some(Boolean);

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Nhật ký thao tác
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          type="date"
          label="Từ ngày"
          name="from"
          value={filters.from}
          onChange={handleChange}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label="Đến ngày"
          name="to"
          value={filters.to}
          onChange={handleChange}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="Tài khoản"
          name="q"
          value={filters.q}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          sx={{ width: 200 }}
        />
        <TextField
          select
          size="small"
          label="Hành động"
          name="action"
          value={filters.action}
          onChange={handleChange}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {actions.map((a) => (
            <MenuItem key={a} value={a}>
              {ACTION_LABELS[a] || a}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={handleSearch}>
          Lọc
        </Button>
        <Button onClick={handleReset}>Xem toàn bộ</Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thời gian</TableCell>
              <TableCell>Tài khoản</TableCell>
              <TableCell>Hành động</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {hasFilter
                    ? "Không tìm thấy nhật ký phù hợp"
                    : "Không có dữ liệu nhật ký thao tác"}
                </TableCell>
              </TableRow>
            )}

            {rows.map((r) => (
              <TableRow key={r.log_id}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatDateTime(r.created_at)}
                </TableCell>
                <TableCell>
                  {r.username}
                  {r.full_name ? ` (${r.full_name})` : ""}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={ACTION_LABELS[r.action] || r.action}
                    color={actionColor(r.action)}
                  />
                </TableCell>
                <TableCell>{r.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Số dòng mỗi trang"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </TableContainer>
    </>
  );
}

export default AuditLogs;
