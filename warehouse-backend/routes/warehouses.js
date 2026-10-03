const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");
const { logAction } = require("../audit");

const router = express.Router();

// GET /api/warehouses nằm ở server.js (khai báo trước route này).
// Hệ thống hiện chạy một kho (warehouse_id = 1) nên chỉ hỗ trợ sửa thông tin kho.

router.put("/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
    try {
        const { warehouse_name, address } = req.body;

        if (!warehouse_name?.trim()) {
            return res.status(400).json({ success: false, message: "Tên kho không được để trống" });
        }
        if (warehouse_name.trim().length > 100 || (address && address.length > 255)) {
            return res.status(400).json({ success: false, message: "Dữ liệu nhập vượt quá độ dài cho phép" });
        }

        const [result] = await pool.query(
            "UPDATE warehouses SET warehouse_name = ?, address = ? WHERE warehouse_id = ?",
            [warehouse_name.trim(), address?.trim() || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy kho" });
        }

        await logAction(req.user.user_id, "WAREHOUSE_UPDATE", `Sửa thông tin kho ${warehouse_name.trim()}`);

        res.json({ success: true, message: "Cập nhật kho thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể cập nhật kho" });
    }
});

module.exports = router;
