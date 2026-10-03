const pool = require("./db");

// Ghi nhật ký thao tác. Không làm hỏng nghiệp vụ chính nếu việc ghi log thất bại.
async function logAction(userId, action, description) {
    try {
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)",
            [userId, action, description]
        );
    } catch (error) {
        console.error("Không ghi được nhật ký:", error.message);
    }
}

module.exports = { logAction };
