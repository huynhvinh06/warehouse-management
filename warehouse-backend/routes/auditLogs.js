const express = require("express");
const pool = require("../db");

const router = express.Router();

// Chỉ ADMIN (gắn ở server.js). UC15: lọc theo ngày, tìm theo tài khoản.
// GET /api/audit-logs?from=YYYY-MM-DD&to=YYYY-MM-DD&q=<tài khoản>&action=<mã hành động>&page=1&limit=20
router.get("/", async (req, res) => {
    try {
        const { from, to, action } = req.query;
        const q = (req.query.q || "").trim();

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if ((from && !datePattern.test(from)) || (to && !datePattern.test(to))) {
            return res.status(400).json({ success: false, message: "Khoảng thời gian không hợp lệ" });
        }
        if (from && to && from > to) {
            return res.status(400).json({ success: false, message: "Khoảng thời gian không hợp lệ" });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

        const where = [];
        const params = [];

        if (from) {
            where.push("l.created_at >= ?");
            params.push(`${from} 00:00:00`);
        }
        if (to) {
            where.push("l.created_at <= ?");
            params.push(`${to} 23:59:59`);
        }
        if (q) {
            where.push("(u.username LIKE ? OR u.full_name LIKE ?)");
            params.push(`%${q}%`, `%${q}%`);
        }
        if (action) {
            where.push("l.action = ?");
            params.push(action);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const [[count]] = await pool.query(
            `SELECT COUNT(*) AS total
             FROM audit_logs l
             INNER JOIN users u ON l.user_id = u.user_id
             ${whereSql}`,
            params
        );

        const [rows] = await pool.query(
            `SELECT l.log_id, l.created_at, l.action, l.description,
                    u.user_id, u.username, u.full_name
             FROM audit_logs l
             INNER JOIN users u ON l.user_id = u.user_id
             ${whereSql}
             ORDER BY l.log_id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, (page - 1) * limit]
        );

        res.json({ total: Number(count.total), page, limit, rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Không thể tải nhật ký thao tác, vui lòng thử lại"
        });
    }
});

// Danh sách mã hành động đã có, dùng cho ô lọc
router.get("/actions", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DISTINCT action FROM audit_logs ORDER BY action"
        );
        res.json(rows.map((r) => r.action));
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể tải danh sách hành động" });
    }
});

module.exports = router;
