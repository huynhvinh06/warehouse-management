const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");

const router = express.Router();

const DEFAULT_WAREHOUSE_ID = 1; // Hệ thống một kho

// Chuẩn hóa & kiểm tra danh sách sản phẩm; trả về chuỗi lỗi hoặc null
function validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return "Vui lòng chọn ít nhất một sản phẩm";
    }
    const seen = new Set();
    for (const it of items) {
        const qty = Number(it.quantity);
        const price = Number(it.unit_price);
        if (!Number.isInteger(Number(it.product_id))) return "Sản phẩm không hợp lệ";
        if (!Number.isInteger(qty) || qty <= 0) return "Số lượng phải là số nguyên lớn hơn 0";
        if (!(price > 0)) return "Số lượng và đơn giá phải lớn hơn 0";
        if (seen.has(Number(it.product_id))) return "Sản phẩm bị trùng trong phiếu";
        seen.add(Number(it.product_id));
    }
    return null;
}

// Danh sách phiếu nhập
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                r.import_id AS id,
                r.import_code AS code,
                r.import_date AS date,
                s.supplier_name AS supplier,
                COALESCE(SUM(d.quantity), 0) AS quantity,
                r.total_amount,
                r.status,
                r.note
            FROM import_receipts r
            INNER JOIN suppliers s ON r.supplier_id = s.supplier_id
            LEFT JOIN import_details d ON r.import_id = d.import_id
            GROUP BY r.import_id, r.import_code, r.import_date, s.supplier_name,
                     r.total_amount, r.status, r.note
            ORDER BY r.import_id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách phiếu nhập" });
    }
});

// Chi tiết một phiếu nhập
router.get("/:id", async (req, res) => {
    try {
        const [receipts] = await pool.query(
            `SELECT r.*, s.supplier_name
             FROM import_receipts r
             INNER JOIN suppliers s ON r.supplier_id = s.supplier_id
             WHERE r.import_id = ?`,
            [req.params.id]
        );

        if (receipts.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phiếu nhập" });
        }

        const [items] = await pool.query(
            `SELECT d.product_id, p.product_code, p.product_name, p.unit,
                    d.quantity, d.unit_price, d.total_price
             FROM import_details d
             INNER JOIN products p ON d.product_id = p.product_id
             WHERE d.import_id = ?`,
            [req.params.id]
        );

        res.json({ ...receipts[0], items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy chi tiết phiếu nhập" });
    }
});

// Lập phiếu nhập: lưu phiếu + chi tiết + tăng tồn + ghi nhật ký (1 transaction)
router.post("/", authorize(...PERMS.STOCK_WRITE), async (req, res) => {
    const { supplier_id, note, items } = req.body;
    const user_id = req.user.user_id; // lấy từ token, không tin dữ liệu client gửi
    const warehouse_id = Number(req.body.warehouse_id) || DEFAULT_WAREHOUSE_ID;

    if (!supplier_id) {
        return res.status(400).json({ success: false, message: "Vui lòng chọn nhà cung cấp" });
    }
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

        const total = items.reduce(
            (sum, it) => sum + Number(it.quantity) * Number(it.unit_price),
            0
        );

        // Mã phiếu tạm, cập nhật lại theo id sau khi insert để đảm bảo duy nhất
        const tempCode = `PN-TMP-${Date.now()}`;

        const [receipt] = await conn.query(
            `INSERT INTO import_receipts
                (import_code, supplier_id, warehouse_id, user_id, total_amount, status, note)
             VALUES (?, ?, ?, ?, ?, 'APPROVED', ?)`,
            [tempCode, supplier_id, warehouse_id, user_id, total, note || null]
        );

        const importId = receipt.insertId;
        const code = `PN${String(importId).padStart(5, "0")}`;

        await conn.query(
            "UPDATE import_receipts SET import_code = ? WHERE import_id = ?",
            [code, importId]
        );

        for (const it of items) {
            await conn.query(
                `INSERT INTO import_details (import_id, product_id, quantity, unit_price)
                 VALUES (?, ?, ?, ?)`,
                [importId, it.product_id, it.quantity, it.unit_price]
            );

            // Tăng tồn (tạo dòng tồn nếu sản phẩm chưa có trong kho)
            await conn.query(
                `INSERT INTO inventory (warehouse_id, product_id, quantity)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
                [warehouse_id, it.product_id, it.quantity]
            );
        }

        await conn.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [user_id, "IMPORT_CREATE", `Lập phiếu nhập ${code} (${items.length} sản phẩm, tổng ${total})`]
        );

        await conn.commit();

        res.status(201).json({
            success: true,
            message: "Lập phiếu nhập thành công",
            import_id: importId,
            import_code: code
        });
    } catch (error) {
        await conn.rollback();
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                success: false,
                message: "Nhà cung cấp, sản phẩm hoặc người dùng không tồn tại"
            });
        }

        res.status(500).json({
            success: false,
            message: "Không thể lập phiếu nhập, vui lòng thử lại"
        });
    } finally {
        conn.release();
    }
});

module.exports = router;
