const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", async (req, res) => {
    try {
        const [[products]] = await pool.query(
            "SELECT COUNT(*) AS total FROM products WHERE status = 1"
        );

        const [[low]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS quantity FROM inventory GROUP BY product_id
            ) i ON i.product_id = p.product_id
            WHERE p.status = 1 AND COALESCE(i.quantity, 0) <= p.min_stock
        `);

        const [[todayIn]] = await pool.query(`
            SELECT COALESCE(SUM(d.quantity), 0) AS total
            FROM import_details d
            JOIN import_receipts r ON r.import_id = d.import_id
            WHERE r.status = 'APPROVED' AND DATE(r.import_date) = CURDATE()
        `);

        const [[todayOut]] = await pool.query(`
            SELECT COALESCE(SUM(d.quantity), 0) AS total
            FROM export_details d
            JOIN export_receipts r ON r.export_id = d.export_id
            WHERE r.status = 'APPROVED' AND DATE(r.export_date) = CURDATE()
        `);

        res.json({
            totalProducts: Number(products.total),
            lowStock: Number(low.total),
            todayIn: Number(todayIn.total),
            todayOut: Number(todayOut.total)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể tải dữ liệu dashboard" });
    }
});

module.exports = router;
