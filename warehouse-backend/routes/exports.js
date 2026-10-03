const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");

const router = express.Router();

const DEFAULT_WAREHOUSE_ID = 1;

function validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return "Vui lòng chọn ít nhất một sản phẩm";
    }
    const seen = new Set();
    for (const it of items) {
        const qty = Number(it.quantity);
        if (!Number.isInteger(Number(it.product_id))) return "Sản phẩm không hợp lệ";
        if (!Number.isInteger(qty) || qty <= 0) return "Số lượng xuất phải lớn hơn 0";
        if (seen.has(Number(it.product_id))) return "Sản phẩm bị trùng trong phiếu";
        seen.add(Number(it.product_id));
    }
    return null;
}

// Danh sách phiếu xuất
// Lưu ý: bảng export_receipts không có cột khách hàng, nên "Khách hàng/Lý do xuất"
// được lưu trong cột note.
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                r.export_id AS id,
                r.export_code AS code,
                r.export_date AS date,
                r.note AS customer,
                COALESCE(SUM(d.quantity), 0) AS quantity,
                r.total_amount,
                r.status
            FROM export_receipts r
            LEFT JOIN export_details d ON r.export_id = d.export_id
            GROUP BY r.export_id, r.export_code, r.export_date, r.note,
                     r.total_amount, r.status
            ORDER BY r.export_id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách phiếu xuất" });
    }
});

// Chi tiết một phiếu xuất
router.get("/:id", async (req, res) => {
    try {
        const [receipts] = await pool.query(
            "SELECT * FROM export_receipts WHERE export_id = ?",
            [req.params.id]
        );

        if (receipts.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phiếu xuất" });
        }

        const [items] = await pool.query(
            `SELECT d.product_id, p.product_code, p.product_name, p.unit,
                    d.quantity, d.unit_price, d.total_price
             FROM export_details d
             INNER JOIN products p ON d.product_id = p.product_id
             WHERE d.export_id = ?`,
            [req.params.id]
        );

        res.json({ ...receipts[0], items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy chi tiết phiếu xuất" });
    }
});

// Lập phiếu xuất: khóa dòng tồn, kiểm tra đủ hàng, trừ tồn, ghi nhật ký (1 transaction)
router.post("/", authorize(...PERMS.STOCK_WRITE), async (req, res) => {
    const { note, items } = req.body;
    const user_id = req.user.user_id; // lấy từ token, không tin dữ liệu client gửi
    const warehouse_id = Number(req.body.warehouse_id) || DEFAULT_WAREHOUSE_ID;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin người lập phiếu" });
    }
    const itemError = validateItems(items);
    if (itemError) {
        return res.status(400).json({ success: false, message: itemError });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Kiểm tra tồn (UC11) với khóa dòng để tránh 2 phiếu cùng dùng một lượng tồn.
        // Duyệt theo product_id tăng dần để giảm nguy cơ deadlock.
        const sorted = [...items].sort((a, b) => Number(a.product_id) - Number(b.product_id));
        const priced = [];

        for (const it of sorted) {
            const [rows] = await conn.query(
                `SELECT i.quantity, p.product_name, p.selling_price
                 FROM inventory i
                 INNER JOIN products p ON i.product_id = p.product_id
                 WHERE i.warehouse_id = ? AND i.product_id = ?
                 FOR UPDATE`,
                [warehouse_id, it.product_id]
            );

            if (rows.length === 0) {
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không tìm thấy thông tin tồn kho của sản phẩm"
                });
            }

            if (Number(it.quantity) > rows[0].quantity) {
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Số lượng tồn kho không đủ để xuất: ${rows[0].product_name} (tồn ${rows[0].quantity}, yêu cầu ${it.quantity})`
                });
            }

            priced.push({
                product_id: Number(it.product_id),
                quantity: Number(it.quantity),
                // Đơn giá lấy từ client nếu hợp lệ, ngược lại dùng giá bán tham khảo
                unit_price: Number(it.unit_price) > 0 ? Number(it.unit_price) : Number(rows[0].selling_price)
            });
        }

        const total = priced.reduce((s, it) => s + it.quantity * it.unit_price, 0);
        const tempCode = `PX-TMP-${Date.now()}`;

        const [receipt] = await conn.query(
            `INSERT INTO export_receipts
                (export_code, warehouse_id, user_id, total_amount, status, note)
             VALUES (?, ?, ?, ?, 'APPROVED', ?)`,
            [tempCode, warehouse_id, user_id, total, note || null]
        );

        const exportId = receipt.insertId;
        const code = `PX${String(exportId).padStart(5, "0")}`;

        await conn.query(
            "UPDATE export_receipts SET export_code = ? WHERE export_id = ?",
            [code, exportId]
        );

        for (const it of priced) {
            await conn.query(
                `INSERT INTO export_details (export_id, product_id, quantity, unit_price)
                 VALUES (?, ?, ?, ?)`,
                [exportId, it.product_id, it.quantity, it.unit_price]
            );

            // Điều kiện quantity >= ? là lớp bảo vệ thứ hai, ngoài CHECK (quantity >= 0)
            const [upd] = await conn.query(
                `UPDATE inventory SET quantity = quantity - ?
                 WHERE warehouse_id = ? AND product_id = ? AND quantity >= ?`,
                [it.quantity, warehouse_id, it.product_id, it.quantity]
            );

            if (upd.affectedRows === 0) {
                throw new Error("INSUFFICIENT_STOCK");
            }
        }

        await conn.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [user_id, "EXPORT_CREATE", `Lập phiếu xuất ${code} (${priced.length} sản phẩm, tổng ${total})`]
        );

        await conn.commit();

        res.status(201).json({
            success: true,
            message: "Xuất kho thành công",
            export_id: exportId,
            export_code: code
        });
    } catch (error) {
        await conn.rollback();
        console.error(error);

        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({
                success: false,
                message: "Số lượng tồn kho không đủ để xuất"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                success: false,
                message: "Sản phẩm hoặc người dùng không tồn tại"
            });
        }

        res.status(500).json({
            success: false,
            message: "Không thể lập phiếu xuất, vui lòng thử lại"
        });
    } finally {
        conn.release();
    }
});

module.exports = router;
