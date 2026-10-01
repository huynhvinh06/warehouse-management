const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "InoTrack Backend đang chạy!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            success: true,
            message: "Kết nối MySQL thành công!",
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Kết nối MySQL thất bại!"
        });
    }
});



// API sản phẩm
app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await pool.query(`
    SELECT
        p.product_id,
        p.product_code,
        p.product_name,
        p.category_id,
        c.category_name,
        p.unit,
        p.import_price,
        p.selling_price,
        p.min_stock,
        COALESCE(i.quantity, 0) AS stock
    FROM products p
    LEFT JOIN categories c
        ON p.category_id = c.category_id
    LEFT JOIN inventory i
        ON p.product_id = i.product_id
`);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách sản phẩm"
        });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const {
            product_code,
            product_name,
            category_id,
            unit,
            import_price,
            selling_price,
            min_stock
        } = req.body;

        const [result] = await pool.query(
            `
            INSERT INTO products
            (
                product_code,
                product_name,
                category_id,
                unit,
                import_price,
                selling_price,
                min_stock
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                product_code,
                product_name,
                category_id,
                unit,
                import_price,
                selling_price,
                min_stock
            ]
        );

        res.status(201).json({
            success: true,
            message: "Thêm sản phẩm thành công",
            product_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể thêm sản phẩm"
        });
    }
});

// Sửa sản phẩm
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_code,
            product_name,
            category_id,
            unit,
            import_price,
            selling_price,
            min_stock
        } = req.body;

        const [result] = await pool.query(
            `
            UPDATE products
            SET
                product_code = ?,
                product_name = ?,
                category_id = ?,
                unit = ?,
                import_price = ?,
                selling_price = ?,
                min_stock = ?
            WHERE product_id = ?
            `,
            [
                product_code,
                product_name,
                category_id,
                unit,
                import_price,
                selling_price,
                min_stock,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật sản phẩm thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể cập nhật sản phẩm"
        });
    }
});
// Xóa sản phẩm
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM products WHERE product_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json({
            success: true,
            message: "Xóa sản phẩm thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể xóa sản phẩm"
        });
    }
});

// API danh mục

// Lấy danh sách danh mục
app.get("/api/categories", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                category_id,
                category_name,
                description
            FROM categories
            ORDER BY category_id
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách danh mục"
        });
    }
});


// Thêm danh mục
app.post("/api/categories", async (req, res) => {
    try {
        const {
            category_name,
            description
        } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục không được để trống"
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO categories
            (
                category_name,
                description
            )
            VALUES (?, ?)
            `,
            [
                category_name.trim(),
                description || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Thêm danh mục thành công",
            category_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể thêm danh mục"
        });
    }
});
// Sửa danh mục
app.put("/api/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên danh mục không được để trống"
            });
        }

        const [result] = await pool.query(
            `
            UPDATE categories
            SET category_name = ?, description = ?
            WHERE category_id = ?
            `,
            [
                category_name.trim(),
                description || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật danh mục thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể cập nhật danh mục"
        });
    }
});


// Xóa danh mục
app.delete("/api/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra danh mục có đang được sản phẩm sử dụng không
        const [products] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM products
            WHERE category_id = ?
            `,
            [id]
        );

        if (products[0].total > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa danh mục đang có sản phẩm sử dụng"
            });
        }

        const [result] = await pool.query(
            `
            DELETE FROM categories
            WHERE category_id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }

        res.json({
            success: true,
            message: "Xóa danh mục thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể xóa danh mục"
        });
    }
});

// API tài khoản - lấy danh sách
app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                u.user_id,
                u.username,
                u.full_name,
                u.phone,
                u.email,
                u.role_id,
                r.role_name,
                u.status,
                u.created_at
            FROM users u
            LEFT JOIN roles r
                ON u.role_id = r.role_id
            ORDER BY u.user_id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách tài khoản"
        });
    }
});
// API tài khoản - thêm
app.post("/api/users", async (req, res) => {
    try {
        const {
            username,
            password,
            full_name,
            phone,
            email,
            role_id,
            status
        } = req.body;

        const [result] = await pool.query(
            `
            INSERT INTO users
            (
                username,
                password,
                full_name,
                phone,
                email,
                role_id,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                username,
                password,
                full_name,
                phone,
                email,
                role_id,
                status
            ]
        );

        res.status(201).json({
            success: true,
            message: "Thêm tài khoản thành công",
            user_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể thêm tài khoản"
        });
    }
});
// API tài khoản - sửa
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            username,
            password,
            full_name,
            phone,
            email,
            role_id,
            status
        } = req.body;

        await pool.query(
            `
            UPDATE users
            SET
                username = ?,
                password = ?,
                full_name = ?,
                phone = ?,
                email = ?,
                role_id = ?,
                status = ?
            WHERE user_id = ?
            `,
            [
                username,
                password,
                full_name,
                phone,
                email,
                role_id,
                status,
                id
            ]
        );

        res.json({
            success: true,
            message: "Cập nhật tài khoản thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể cập nhật tài khoản"
        });
    }
});
// API tài khoản - xóa
app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Xóa tài khoản thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể xóa tài khoản"
        });
    }
});

app.listen(5000, () => {
    console.log("InoTrack Backend: http://localhost:5000");
});