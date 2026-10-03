const express = require("express");
const pool = require("../db");
const { hashPassword } = require("../auth");

const router = express.Router();

// Toàn bộ route trong file này chỉ dành cho ADMIN (gắn ở server.js)

async function writeLog(userId, action, description) {
    try {
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [userId, action, description]
        );
    } catch (e) {
        console.error("Không ghi được nhật ký:", e.message);
    }
}

async function roleExists(roleId) {
    const [rows] = await pool.query("SELECT 1 FROM roles WHERE role_id = ?", [roleId]);
    return rows.length > 0;
}

// Danh sách tài khoản (không trả về mật khẩu)
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.user_id, u.username, u.full_name, u.phone, u.email,
                   u.role_id, r.role_name, u.status, u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách tài khoản" });
    }
});

// Thêm tài khoản
router.post("/", async (req, res) => {
    try {
        const { username, password, full_name, phone, email, role_id } = req.body;
        const status = Number(req.body.status ?? 1) === 1 ? 1 : 0;

        if (!username?.trim() || !full_name?.trim()) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập và họ tên không được để trống" });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }
        if (!(await roleExists(role_id))) {
            return res.status(400).json({ success: false, message: "Vai trò không hợp lệ" });
        }

        const [result] = await pool.query(
            `INSERT INTO users (username, password, full_name, phone, email, role_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username.trim(), hashPassword(password), full_name.trim(), phone || null, email || null, role_id, status]
        );

        await writeLog(req.user.user_id, "USER_CREATE", `Tạo tài khoản ${username.trim()}`);

        res.status(201).json({
            success: true,
            message: "Thêm tài khoản thành công",
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Tên đăng nhập hoặc email đã tồn tại" });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể thêm tài khoản" });
    }
});

// Sửa tài khoản / phân quyền. Để trống mật khẩu = giữ mật khẩu cũ.
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { username, password, full_name, phone, email, role_id } = req.body;
        const status = Number(req.body.status ?? 1) === 1 ? 1 : 0;

        if (!username?.trim() || !full_name?.trim()) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập và họ tên không được để trống" });
        }
        if (password && password.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }
        if (!(await roleExists(role_id))) {
            return res.status(400).json({ success: false, message: "Vai trò không hợp lệ" });
        }

        const [current] = await pool.query(
            "SELECT role_id, status FROM users WHERE user_id = ?",
            [id]
        );
        if (current.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
        }

        // Tránh tự khóa hoặc tự hạ quyền chính mình, làm hệ thống mất quản trị viên
        if (id === req.user.user_id && (status !== 1 || Number(role_id) !== current[0].role_id)) {
            return res.status(400).json({
                success: false,
                message: "Không thể khóa hoặc đổi vai trò của chính tài khoản đang đăng nhập"
            });
        }

        const fields = ["username = ?", "full_name = ?", "phone = ?", "email = ?", "role_id = ?", "status = ?"];
        const values = [username.trim(), full_name.trim(), phone || null, email || null, role_id, status];

        if (password) {
            fields.push("password = ?");
            values.push(hashPassword(password));
        }

        await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`, [...values, id]);

        const roleChanged = Number(role_id) !== current[0].role_id;
        await writeLog(
            req.user.user_id,
            roleChanged ? "ROLE_CHANGE" : "USER_UPDATE",
            roleChanged
                ? `Đổi vai trò tài khoản ${username.trim()} sang role_id ${role_id}`
                : `Cập nhật tài khoản ${username.trim()}`
        );

        res.json({ success: true, message: "Cập nhật tài khoản thành công" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Tên đăng nhập hoặc email đã tồn tại" });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể cập nhật tài khoản" });
    }
});

// Xóa tài khoản
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (id === req.user.user_id) {
            return res.status(400).json({ success: false, message: "Không thể xóa tài khoản đang đăng nhập" });
        }

        const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
        }

        await writeLog(req.user.user_id, "USER_DELETE", `Xóa tài khoản user_id ${id}`);

        res.json({ success: true, message: "Xóa tài khoản thành công" });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                success: false,
                message: "Tài khoản đã phát sinh giao dịch, hãy khóa tài khoản thay vì xóa"
            });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Không thể xóa tài khoản" });
    }
});

module.exports = router;
