4. Cài đặt
Bước 1: Clone project
git clone https://github.com/huynhvinh06/warehouse-management.git
cd warehouse-management
Bước 2: Cài đặt Backend
cd warehouse-backend
npm install

Tạo file .env trong thư mục warehouse-backend:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=warehouse_management
DB_PORT=3306

Thay YOUR_MYSQL_PASSWORD bằng mật khẩu MySQL trên máy của bạn.

Bước 3: Cài đặt Frontend

Mở terminal mới:

cd warehouse-frontend
npm install
5. Cài đặt Database

Mở MySQL Workbench và import file:

database/warehouse_management.sql

Database cần có tên:

warehouse_management

Sau khi import, kiểm tra database có đầy đủ các bảng.

6. Chạy project
Chạy Backend

Mở terminal:

cd warehouse-backend
node server.js

Nếu thành công:

InoTrack Backend: http://localhost:5000
Chạy Frontend

Mở terminal khác:

cd warehouse-frontend
npm run dev

Sau đó mở địa chỉ được Vite cung cấp, thường là:

http://localhost:5173
7. Kiểm tra kết nối Database

Sau khi backend đang chạy, truy cập:

http://localhost:5000/api/test-db

Nếu kết nối thành công sẽ nhận được:

{
  "success": true,
  "message": "Kết nối MySQL thành công!"
}
8. API hiện tại
Lấy danh sách sản phẩm
GET /api/products
Thêm sản phẩm
POST /api/products

Ví dụ:

{
  "product_code": "SP001",
  "product_name": "Coca Cola",
  "category_id": 1,
  "unit": "Lon",
  "import_price": 7000,
  "selling_price": 10000,
  "min_stock": 20
}
9. Lưu ý
Không commit file .env lên GitHub.
Không đưa mật khẩu MySQL thật vào source code.
Cần chạy MySQL trước khi chạy Backend.
Backend và Frontend phải được chạy đồng thời.
npm install chỉ cần thực hiện lần đầu hoặc khi package.json thay đổi.