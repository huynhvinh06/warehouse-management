const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { authenticate, authorize, PERMS } = require("./auth");
const { logAction } = require("./audit");

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



// Đăng nhập (công khai)
app.use("/api", require("./routes/auth"));

// Từ đây trở xuống, mọi API đều yêu cầu đăng nhập
app.use("/api", authenticate);

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

app.post("/api/products", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "PRODUCT_CREATE", `Thêm sản phẩm ${product_code} - ${product_name}`);
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
app.put("/api/products/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "PRODUCT_UPDATE", `Sửa sản phẩm ${product_code} - ${product_name}`);
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
app.delete("/api/products/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "PRODUCT_DELETE", `Xóa sản phẩm id ${id}`);
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
app.post("/api/categories", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "CATEGORY_CREATE", `Thêm danh mục ${category_name.trim()}`);
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
app.put("/api/categories/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "CATEGORY_UPDATE", `Sửa danh mục ${category_name.trim()}`);
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
app.delete("/api/categories/:id", authorize(...PERMS.CATALOG_WRITE), async (req, res) => {
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

        await logAction(req.user.user_id, "CATEGORY_DELETE", `Xóa danh mục id ${id}`);
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

// API danh sách kho
app.get("/api/warehouses", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                w.warehouse_id,
                w.warehouse_name,
                w.address,
                COUNT(DISTINCT i.product_id) AS productCount
            FROM warehouses w
            LEFT JOIN inventory i
                ON w.warehouse_id = i.warehouse_id
            WHERE w.status = 1
            GROUP BY
                w.warehouse_id,
                w.warehouse_name,
                w.address
            ORDER BY w.warehouse_id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách kho"
        });
    }
});
// API tồn kho
app.get("/api/inventory", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                w.warehouse_id,
                w.warehouse_name,
                p.product_id,
                p.product_code,
                p.product_name,
                p.unit,
                COALESCE(i.quantity, 0) AS stock,
                p.min_stock,
                CASE
                    WHEN COALESCE(i.quantity, 0) = 0 THEN 'Hết hàng'
                    WHEN COALESCE(i.quantity, 0) <= p.min_stock THEN 'Sắp hết'
                    ELSE 'Đủ hàng'
                END AS stock_status
            FROM warehouses w
            CROSS JOIN products p
            LEFT JOIN inventory i
                ON i.warehouse_id = w.warehouse_id
               AND i.product_id = p.product_id
            WHERE w.status = 1
            ORDER BY w.warehouse_id ASC, p.product_id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy dữ liệu tồn kho"
        });
    }
});

// Các route mở rộng
app.use("/api/users", authorize(...PERMS.ADMIN_ONLY), require("./routes/users"));
app.use("/api/audit-logs", authorize(...PERMS.ADMIN_ONLY), require("./routes/auditLogs"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/imports", require("./routes/imports"));
app.use("/api/exports", require("./routes/exports"));
app.use("/api/stocktakes", require("./routes/stocktakes"));
app.use("/api/warehouses", require("./routes/warehouses"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.listen(5000, () => {
    console.log("InoTrack Backend: http://localhost:5000");
});