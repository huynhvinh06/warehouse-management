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

app.listen(5000, () => {
    console.log("InoTrack Backend: http://localhost:5000");
});