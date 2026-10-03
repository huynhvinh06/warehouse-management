// Xác thực (JWT HS256) và phân quyền theo vai trò.
// Chỉ dùng module crypto có sẵn của Node.js nên không cần cài thêm package.
const crypto = require("crypto");
const pool = require("./db");

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 giờ

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    SECRET = crypto.randomBytes(32).toString("hex");
    console.warn(
        "[auth] Chưa đặt JWT_SECRET trong .env: dùng khóa ngẫu nhiên, mọi người dùng sẽ phải đăng nhập lại mỗi lần khởi động server."
    );
}

// Vai trò (khớp bảng roles) và nhóm quyền theo báo cáo
const ROLES = { ADMIN: "ADMIN", MANAGER: "MANAGER", STAFF: "STAFF" };

const PERMS = {
    ALL: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
    // Thêm/sửa/xóa sản phẩm, danh mục, nhà cung cấp; xem báo cáo
    CATALOG_WRITE: [ROLES.ADMIN, ROLES.MANAGER],
    REPORT_VIEW: [ROLES.ADMIN, ROLES.MANAGER],
    // Lập phiếu nhập, phiếu xuất
    STOCK_WRITE: [ROLES.ADMIN, ROLES.STAFF],
    // Quản lý tài khoản, phân quyền
    ADMIN_ONLY: [ROLES.ADMIN]
};

// ---------- Mật khẩu (scrypt) ----------
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const key = crypto.scryptSync(password, salt, 64).toString("hex");
    return `scrypt$${salt}$${key}`;
}

function isHashed(stored) {
    return typeof stored === "string" && stored.startsWith("scrypt$");
}

function verifyPassword(password, stored) {
    if (typeof password !== "string" || typeof stored !== "string") return false;

    if (isHashed(stored)) {
        const [, salt, key] = stored.split("$");
        if (!salt || !key) return false;
        const actual = crypto.scryptSync(password, salt, 64);
        const expected = Buffer.from(key, "hex");
        return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
    }

    // Mật khẩu cũ lưu dạng chữ thường (dữ liệu mẫu): so sánh an toàn thời gian,
    // sau đó đăng nhập sẽ tự nâng cấp sang dạng băm.
    const a = crypto.createHash("sha256").update(password).digest();
    const b = crypto.createHash("sha256").update(stored).digest();
    return crypto.timingSafeEqual(a, b);
}

// ---------- JWT ----------
function signToken(payload) {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
        JSON.stringify({ ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS })
    ).toString("base64url");
    const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;

    try {
        if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") return null;

        const expected = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest();
        const actual = Buffer.from(sig, "base64url");
        if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

        const payload = JSON.parse(Buffer.from(body, "base64url").toString());
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

        return payload;
    } catch {
        return null;
    }
}

// ---------- Middleware ----------
// Yêu cầu đăng nhập. Kiểm tra lại tài khoản trong CSDL ở mỗi yêu cầu nên
// việc khóa tài khoản hoặc đổi vai trò có hiệu lực ngay.
async function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        const payload = verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"
            });
        }

        const [rows] = await pool.query(
            `SELECT u.user_id, u.username, u.full_name, u.status, r.role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [payload.sub]
        );

        if (rows.length === 0 || Number(rows[0].status) !== 1) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại hoặc đã bị khóa"
            });
        }

        req.user = {
            user_id: rows[0].user_id,
            username: rows[0].username,
            full_name: rows[0].full_name,
            role_name: rows[0].role_name
        };

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

// Giới hạn theo vai trò: authorize(...PERMS.CATALOG_WRITE)
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role_name)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền thực hiện chức năng này"
            });
        }
        next();
    };
}

module.exports = {
    ROLES,
    PERMS,
    hashPassword,
    verifyPassword,
    isHashed,
    signToken,
    verifyToken,
    authenticate,
    authorize
};
