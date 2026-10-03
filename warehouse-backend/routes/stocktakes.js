const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");

const router = express.Router();

const DEFAULT_WAREHOUSE_ID = 1; // Hệ thống một kho
const MAX_INT = 2147483647;

// Danh sách phiếu kiểm kê
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.stocktake_id AS id,
                s.stocktake_code AS code,
                s.stocktake_date AS date,
                s.status,
                s.note,
                u.full_name AS user_name,
                COUNT(d.stocktake_detail_id) AS item_count,
                COALESCE(SUM(d.difference <> 0), 0) AS diff_lines,
                COALESCE(SUM(d.difference), 0) AS net_difference
            FROM stocktakes s
            INNER JOIN users u ON s.user_id = u.user_id
            LEFT JOIN stocktake_details d ON s.stocktake_id = d.stocktake_id
            GROUP BY s.stocktake_id, s.stocktake_code, s.stocktake_date, s.status, s.note, u.full_name
            ORDER BY s.stocktake_id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách phiếu kiểm kê" });
    }
});

// Bảng dữ liệu kiểm kê: sản phẩm + số lượng trên hệ thống (bước 2 của UC12)
// Phải khai báo trước "/:id"
router.get("/sheet", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.product_id, p.product_code, p.product_name, p.unit,
                    COALESCE(i.quantity, 0) AS system_quantity
             FROM products p
             LEFT JOIN inventory i
                    ON i.product_id = p.product_id AND i.warehouse_id = ?
             WHERE p.status = 1
             ORDER BY p.product_code`,
            [DEFAULT_WAREHOUSE_ID]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy dữ liệu kiểm kê" });
    }
});

// Chi tiết một phiếu kiểm kê
router.get("/:id", async (req, res) => {
    try {
        const [stocktakes] = await pool.query(
            `SELECT s.*, u.full_name AS user_name
             FROM stocktakes s
             INNER JOIN users u ON s.user_id = u.user_id
             WHERE s.stocktake_id = ?`,
            [req.params.id]
        );

        if (stocktakes.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phiếu kiểm kê" });
        }

        const [items] = await pool.query(
            `SELECT d.product_id, p.product_code, p.product_name, p.unit,
                    d.system_quantity, d.actual_quantity, d.difference
             FROM stocktake_details d
             INNER JOIN products p ON d.product_id = p.product_id
             WHERE d.stocktake_id = ?
             ORDER BY p.product_code`,
            [req.params.id]
        );

        res.json({ ...stocktakes[0], items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy chi tiết phiếu kiểm kê" });
    }
});

// Xác nhận kiểm kê: lưu phiếu + chi tiết và điều chỉnh tồn theo số thực tế (1 transaction)
router.post("/", authorize(...PERMS.STOCK_WRITE), async (req, res) => {
    const { note, items } = req.body;
    const user_id = req.user.user_id;
    const warehouse_id = Number(req.body.warehouse_id) || DEFAULT_WAREHOUSE_ID;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Không có sản phẩm nào để kiểm kê" });
    }

    // E1: thiếu số lượng thực tế
    for (const it of items) {
        if (it.actual_quantity === undefined || it.actual_quantity === null || String(it.actual_quantity).trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ số lượng thực tế" });
        }
    }

    // E2: số lượng thực tế phải là số nguyên không âm
    const seen = new Set();
    for (const it of items) {
        const qty = Number(it.actual_quantity);
        const productId = Number(it.product_id);

        if (!Number.isInteger(qty) || qty < 0 || qty > MAX_INT || !Number.isInteger(productId)) {
            return res.status(400).json({ success: false, message: "Số lượng thực tế không hợp lệ" });
        }
        if (seen.has(productId)) {
            return res.status(400).json({ success: false, message: "Sản phẩm bị trùng trong phiếu kiểm kê" });
        }
        seen.add(productId);
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const tempCode = `KK-TMP-${Date.now()}`;

        const [receipt] = await conn.query(
            `INSERT INTO stocktakes (stocktake_code, warehouse_id, user_id, status, note)
             VALUES (?, ?, ?, 'COMPLETED', ?)`,
            [tempCode, warehouse_id, user_id, note || null]
        );

        const stocktakeId = receipt.insertId;
        const code = `KK${String(stocktakeId).padStart(5, "0")}`;

        await conn.query(
            "UPDATE stocktakes SET stocktake_code = ? WHERE stocktake_id = ?",
            [code, stocktakeId]
        );

        // Duyệt theo product_id tăng dần để giảm nguy cơ deadlock
        const sorted = items
            .map((it) => ({ product_id: Number(it.product_id), actual: Number(it.actual_quantity) }))
            .sort((a, b) => a.product_id - b.product_id);

        let diffLines = 0;

        for (const it of sorted) {
            // Bảo đảm có dòng tồn rồi khóa nó, để số hệ thống được chốt tại thời điểm xác nhận
            await conn.query(
                `INSERT INTO inventory (warehouse_id, product_id, quantity)
                 VALUES (?, ?, 0)
                 ON DUPLICATE KEY UPDATE quantity = quantity`,
                [warehouse_id, it.product_id]
            );

            const [inv] = await conn.query(
                `SELECT quantity FROM inventory
                 WHERE warehouse_id = ? AND product_id = ?
                 FOR UPDATE`,
                [warehouse_id, it.product_id]
            );

            const systemQty = inv[0].quantity;
            if (it.actual !== systemQty) diffLines += 1;

            await conn.query(
                `INSERT INTO stocktake_details (stocktake_id, product_id, system_quantity, actual_quantity)
                 VALUES (?, ?, ?, ?)`,
                [stocktakeId, it.product_id, systemQty, it.actual]
            );

            await conn.query(
                "UPDATE inventory SET quantity = ? WHERE warehouse_id = ? AND product_id = ?",
                [it.actual, warehouse_id, it.product_id]
            );
        }

        await conn.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [user_id, "STOCKTAKE_CREATE", `Lập phiếu kiểm kê ${code} (${sorted.length} sản phẩm, ${diffLines} dòng chênh lệch)`]
        );

        await conn.commit();

        res.status(201).json({
            success: true,
            message: "Lưu phiếu kiểm kê và cập nhật tồn kho thành công",
            stocktake_id: stocktakeId,
            stocktake_code: code,
            diff_lines: diffLines
        });
    } catch (error) {
        await conn.rollback();
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ success: false, message: "Sản phẩm hoặc kho không tồn tại" });
        }

        // E3/E4: rollback toàn bộ, không để dữ liệu dở dang
        res.status(500).json({
            success: false,
            message: "Không thể lưu phiếu kiểm kê, vui lòng thử lại"
        });
    } finally {
        conn.release();
    }
});

module.exports = router;
