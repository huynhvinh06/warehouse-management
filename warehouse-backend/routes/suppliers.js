const express = require("express");
const pool = require("../db");
const { authorize, PERMS } = require("../auth");
const { logAction } = require("../audit");

const router = express.Router();

// Kiểm tra dữ liệu đầu vào; trả về chuỗi lỗi hoặc null
function validateSupplier({ supplier_code, supplier_name, phone, email, address }) {
    if (!supplier_code?.trim() || !supplier_name?.trim()) {
        return "Mã và tên nhà cung cấp không được để trống";
    }
    if (supplier_code.trim().length > 50 || supplier_name.trim().length > 150 || (address && address.length > 255)) {
        return "Dữ liệu nhập vượt quá độ dài cho phép";
    }
    if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone.trim())) {
        return "Số điện thoại không hợp lệ";
    }
    if (email && (email.length > 100 || !/^\S+@\S+\.\S+$/.test(email.trim()))) {
        return "Email không hợp lệ";
    }
    return null;
}

// Lấy danh sách nhà cung cấp (có tìm kiếm ?q=)
router.get("/", async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        const like = `%${q}%`;

        const [rows] = await pool.query(
            `
            SELECT supplier_id, supplier_code, supplier_name, phone, email, address, status
            FROM suppliers
            WHERE status = 1
              AND (? = '' OR supplier_code LIKE ? OR supplier_name LIKE ?)
            ORDER BY supplier_id ASC
            `,
            [q, like, like]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách nhà cung cấp" });
    }
});

// Thêm nhà cung cấp
router.post("/", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
    try {
        const { supplier_code, supplier_name, phone, email, address } = req.body;

        const validationError = validateSupplier(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const [result] = await pool.query(
            `INSERT INTO suppliers (supplier_code, supplier_name, phone, email, address)
             VALUES (?, ?, ?, ?, ?)`,
            [supplier_code.trim(), supplier_name.trim(), phone || null, email || null, address || null]
        );

        await logAction(req.user.user_id, "SUPPLIER_CREATE", `Thêm nhà cung cấp ${supplier_code.trim()} - ${supplier_name.trim()}`);
        res.status(201).json({
            success: true,
            message: "Thêm nhà cung cấp thành công",
            supplier_id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Nhà cung cấp đã tồn tại" });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể thêm nhà cung cấp" });
    }
});

// Sửa nhà cung cấp
router.put("/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
    try {
        const { supplier_code, supplier_name, phone, email, address } = req.body;

        const validationError = validateSupplier(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const [result] = await pool.query(
            `UPDATE suppliers
             SET supplier_code = ?, supplier_name = ?, phone = ?, email = ?, address = ?
             WHERE supplier_id = ?`,
            [supplier_code.trim(), supplier_name.trim(), phone || null, email || null, address || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp" });
        }

        await logAction(req.user.user_id, "SUPPLIER_UPDATE", `Sửa nhà cung cấp ${supplier_code.trim()} - ${supplier_name.trim()}`);
        res.json({ success: true, message: "Cập nhật nhà cung cấp thành công" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Nhà cung cấp đã tồn tại" });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể cập nhật nhà cung cấp" });
    }
});

// Xóa nhà cung cấp (chặn nếu đã có phiếu nhập)
router.delete("/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
    try {
        const [used] = await pool.query(
            "SELECT COUNT(*) AS total FROM import_receipts WHERE supplier_id = ?",
            [req.params.id]
        );

        if (used[0].total > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa nhà cung cấp đang có giao dịch nhập kho"
            });
        }

        const [result] = await pool.query(
            "DELETE FROM suppliers WHERE supplier_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp" });
        }

        await logAction(req.user.user_id, "SUPPLIER_DELETE", `Xóa nhà cung cấp id ${req.params.id}`);
        res.json({ success: true, message: "Xóa nhà cung cấp thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể xóa nhà cung cấp" });
    }
});

module.exports = router;
