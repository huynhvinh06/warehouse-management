const express = require("express");
const pool = require("../db");
const { hashPassword, verifyPassword, isHashed, signToken } = require("../auth");

const router = express.Router();

// Giới hạn đăng nhập sai: 5 lần / 15 phút cho mỗi (IP + tên đăng nhập)
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map();

function failKey(req, username) {
    return `${req.ip}|${String(username).toLowerCase()}`;
}

function isLocked(key) {
    const rec = fails.get(key);
    if (!rec) return false;
    if (Date.now() - rec.first > WINDOW_MS) {
        fails.delete(key);
        return false;
    }
    return rec.count >= MAX_FAILS;
}

function recordFail(key) {
    const rec = fails.get(key);
    if (!rec || Date.now() - rec.first > WINDOW_MS) {
        fails.set(key, { count: 1, first: Date.now() });
    } else {
        rec.count += 1;
    }
}

// POST /api/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tên đăng nhập và mật khẩu"
            });
        }

        const key = failKey(req, username);

        if (isLocked(key)) {
            return res.status(429).json({
                success: false,
                message: "Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút"
            });
        }

        const [rows] = await pool.query(
            `SELECT u.user_id, u.username, u.password, u.full_name, u.email, u.phone,
                    u.role_id, r.role_name, u.status
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.role_id
             WHERE u.username = ?
             LIMIT 1`,
            [username]
        );

        const found = rows[0];

        if (!found || !verifyPassword(password, found.password)) {
            recordFail(key);
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng"
            });
        }

        if (Number(found.status) !== 1) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị khóa"
            });
        }

        fails.delete(key);

        // Mật khẩu còn ở dạng chữ thường (dữ liệu cũ) thì băm lại ngay
        if (!isHashed(found.password)) {
            await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
                hashPassword(password),
                found.user_id
            ]);
        }

        pool.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [found.user_id, "LOGIN", `Đăng nhập: ${found.username}`]
        ).catch((e) => console.error("Không ghi được nhật ký đăng nhập:", e.message));

        const { password: _omit, ...user } = found;

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: signToken({ sub: found.user_id }),
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
});

module.exports = router;
