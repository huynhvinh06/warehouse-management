const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");

const router = express.Router();

// Báo cáo nhập - xuất - tồn theo khoảng ngày: GET /api/reports/inventory?from=YYYY-MM-DD&to=YYYY-MM-DD
// Tồn đầu kỳ = Tồn hiện tại - Nhập (từ ngày đến nay) + Xuất (từ ngày đến nay) - Điều chỉnh kiểm kê (từ ngày đến nay)
// Tồn cuối kỳ = Tồn đầu kỳ + Nhập trong kỳ - Xuất trong kỳ + Điều chỉnh kiểm kê trong kỳ
// (kiểm kê làm thay đổi tồn mà không qua phiếu nhập/xuất nên phải cộng/trừ riêng)
router.get("/inventory", authorize(...PERMS.REPORT_VIEW), async (req, res) => {
    try {
        const { from, to } = req.query;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(from || "") || !/^\d{4}-\d{2}-\d{2}$/.test(to || "")) {
            return res.status(400).json({ success: false, message: "Khoảng thời gian không hợp lệ" });
        }
        if (from > to) {
            return res.status(400).json({ success: false, message: "Khoảng thời gian không hợp lệ" });
        }

        const fromTs = `${from} 00:00:00`;
        const toTs = `${to} 23:59:59`;

        // Chi tiết theo từng sản phẩm
        const [items] = await pool.query(
            `
            SELECT
                p.product_id,
                p.product_code,
                p.product_name,
                p.unit,
                COALESCE(inv.quantity, 0) AS current_stock,
                COALESCE(imp_in.qty, 0)  AS total_in,
                COALESCE(exp_in.qty, 0)  AS total_out,
                COALESCE(imp_after.qty, 0) AS import_since,
                COALESCE(exp_after.qty, 0) AS export_since,
                COALESCE(adj_in.qty, 0) AS adjust_in_period,
                COALESCE(adj_after.qty, 0) AS adjust_since
            FROM products p
            LEFT JOIN (
                SELECT product_id, SUM(quantity) AS quantity
                FROM inventory GROUP BY product_id
            ) inv ON inv.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.quantity) AS qty
                FROM import_details d
                JOIN import_receipts r ON r.import_id = d.import_id
                WHERE r.status = 'APPROVED' AND r.import_date BETWEEN ? AND ?
                GROUP BY d.product_id
            ) imp_in ON imp_in.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.quantity) AS qty
                FROM export_details d
                JOIN export_receipts r ON r.export_id = d.export_id
                WHERE r.status = 'APPROVED' AND r.export_date BETWEEN ? AND ?
                GROUP BY d.product_id
            ) exp_in ON exp_in.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.quantity) AS qty
                FROM import_details d
                JOIN import_receipts r ON r.import_id = d.import_id
                WHERE r.status = 'APPROVED' AND r.import_date >= ?
                GROUP BY d.product_id
            ) imp_after ON imp_after.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.quantity) AS qty
                FROM export_details d
                JOIN export_receipts r ON r.export_id = d.export_id
                WHERE r.status = 'APPROVED' AND r.export_date >= ?
                GROUP BY d.product_id
            ) exp_after ON exp_after.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.difference) AS qty
                FROM stocktake_details d
                JOIN stocktakes s ON s.stocktake_id = d.stocktake_id
                WHERE s.status = 'COMPLETED' AND s.stocktake_date BETWEEN ? AND ?
                GROUP BY d.product_id
            ) adj_in ON adj_in.product_id = p.product_id
            LEFT JOIN (
                SELECT d.product_id, SUM(d.difference) AS qty
                FROM stocktake_details d
                JOIN stocktakes s ON s.stocktake_id = d.stocktake_id
                WHERE s.status = 'COMPLETED' AND s.stocktake_date >= ?
                GROUP BY d.product_id
            ) adj_after ON adj_after.product_id = p.product_id
            ORDER BY p.product_id
            `,
            [fromTs, toTs, fromTs, toTs, fromTs, fromTs, fromTs, toTs, fromTs]
        );

        const details = items.map((r) => {
            const total_in = Number(r.total_in);
            const total_out = Number(r.total_out);
            const adjust = Number(r.adjust_in_period);
            const opening =
                Number(r.current_stock) - Number(r.import_since) + Number(r.export_since) - Number(r.adjust_since);
            return {
                product_id: r.product_id,
                product_code: r.product_code,
                product_name: r.product_name,
                unit: r.unit,
                openingStock: opening,
                totalIn: total_in,
                totalOut: total_out,
                adjustment: adjust,
                closingStock: opening + total_in - total_out + adjust
            };
        });

        const sum = (key) => details.reduce((s, d) => s + d[key], 0);

        res.json({
            openingStock: sum("openingStock"),
            totalIn: sum("totalIn"),
            totalOut: sum("totalOut"),
            totalAdjust: sum("adjustment"),
            closingStock: sum("closingStock"),
            details
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể tải dữ liệu báo cáo, vui lòng thử lại" });
    }
});

module.exports = router;
