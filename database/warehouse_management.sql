-- MySQL dump 10.13  Distrib 26.7.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: warehouse_management
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'cf2a00c0-b10c-11f1-bdeb-c01803c73186:1-81';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'IMPORT_CREATE','Lập phiếu nhập PN00001 (1 sản phẩm, tổng 70000)','2026-10-02 09:58:19'),(2,1,'LOGIN','Đăng nhập: admin','2026-10-02 22:00:02'),(3,5,'LOGIN','Đăng nhập: nhanvien2','2026-10-02 22:00:33'),(4,2,'LOGIN','Đăng nhập: manager','2026-10-02 22:06:23'),(5,1,'LOGIN','Đăng nhập: admin','2026-10-02 22:11:56'),(6,1,'LOGIN','Đăng nhập: admin','2026-10-02 22:19:36'),(7,1,'LOGIN','Đăng nhập: admin','2026-10-03 18:37:11'),(8,1,'LOGIN','Đăng nhập: admin','2026-10-03 18:40:24'),(9,1,'USER_DELETE','Xóa tài khoản user_id 6','2026-10-03 18:46:24'),(10,3,'LOGIN','Đăng nhập: staff','2026-10-03 18:47:32'),(11,2,'LOGIN','Đăng nhập: manager','2026-10-03 18:48:22'),(12,1,'LOGIN','Đăng nhập: admin','2026-10-03 19:00:12'),(13,1,'LOGIN','Đăng nhập: admin','2026-10-03 23:18:08'),(14,1,'PRODUCT_CREATE','Thêm sản phẩm SP006 - Bàn phím','2026-10-03 23:19:20'),(15,1,'CATEGORY_UPDATE','Sửa danh mục Đồ điện tử','2026-10-03 23:19:50'),(16,1,'LOGIN','Đăng nhập: admin','2026-10-03 23:22:19'),(17,1,'PRODUCT_UPDATE','Sửa sản phẩm SP006 - Bàn phím','2026-10-03 23:22:31'),(18,1,'CATEGORY_CREATE','Thêm danh mục Hàng thủ công','2026-10-03 23:23:00'),(19,1,'PRODUCT_CREATE','Thêm sản phẩm SP007 - Móc khóa thú bông','2026-10-03 23:23:37'),(20,1,'LOGIN','Đăng nhập: admin','2026-10-03 23:30:22'),(21,1,'LOGIN','Đăng nhập: admin','2026-10-03 23:31:30');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Đồ uống','Các loại nước uống'),(2,'Thực phẩm','Các loại thực phẩm'),(3,'Đồ gia dụng','Các sản phẩm gia dụng'),(6,'Đồ điện tử','đồ điện'),(7,'Hàng thủ công','Các mặc hàng thủ công');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_details`
--

DROP TABLE IF EXISTS `export_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_details` (
  `export_detail_id` int NOT NULL AUTO_INCREMENT,
  `export_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`export_detail_id`),
  KEY `export_id` (`export_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `export_details_ibfk_1` FOREIGN KEY (`export_id`) REFERENCES `export_receipts` (`export_id`),
  CONSTRAINT `export_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `export_details_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_details`
--

LOCK TABLES `export_details` WRITE;
/*!40000 ALTER TABLE `export_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `export_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export_receipts`
--

DROP TABLE IF EXISTS `export_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export_receipts` (
  `export_id` int NOT NULL AUTO_INCREMENT,
  `export_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` int NOT NULL,
  `user_id` int NOT NULL,
  `export_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('DRAFT','PENDING','APPROVED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`export_id`),
  UNIQUE KEY `export_code` (`export_code`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `export_receipts_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  CONSTRAINT `export_receipts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export_receipts`
--

LOCK TABLES `export_receipts` WRITE;
/*!40000 ALTER TABLE `export_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `export_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_details`
--

DROP TABLE IF EXISTS `import_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_details` (
  `import_detail_id` int NOT NULL AUTO_INCREMENT,
  `import_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  PRIMARY KEY (`import_detail_id`),
  KEY `import_id` (`import_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `import_details_ibfk_1` FOREIGN KEY (`import_id`) REFERENCES `import_receipts` (`import_id`),
  CONSTRAINT `import_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `import_details_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_details`
--

LOCK TABLES `import_details` WRITE;
/*!40000 ALTER TABLE `import_details` DISABLE KEYS */;
INSERT INTO `import_details` (`import_detail_id`, `import_id`, `product_id`, `quantity`, `unit_price`) VALUES (1,1,2,10,7000.00);
/*!40000 ALTER TABLE `import_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_receipts`
--

DROP TABLE IF EXISTS `import_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_receipts` (
  `import_id` int NOT NULL AUTO_INCREMENT,
  `import_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int NOT NULL,
  `warehouse_id` int NOT NULL,
  `user_id` int NOT NULL,
  `import_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('DRAFT','PENDING','APPROVED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`import_id`),
  UNIQUE KEY `import_code` (`import_code`),
  KEY `supplier_id` (`supplier_id`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `import_receipts_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `import_receipts_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  CONSTRAINT `import_receipts_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_receipts`
--

LOCK TABLES `import_receipts` WRITE;
/*!40000 ALTER TABLE `import_receipts` DISABLE KEYS */;
INSERT INTO `import_receipts` VALUES (1,'PN00001',2,1,1,'2026-10-02 09:58:19',70000.00,'APPROVED',NULL);
/*!40000 ALTER TABLE `import_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `warehouse_id` (`warehouse_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `inventory_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,1,100,'2026-09-25 22:52:10'),(2,1,2,90,'2026-10-02 09:58:19'),(3,1,3,50,'2026-09-25 22:52:10'),(4,1,4,120,'2026-09-25 22:52:10'),(5,1,5,40,'2026-09-25 22:52:10');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `unit` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `import_price` decimal(15,2) DEFAULT '0.00',
  `selling_price` decimal(15,2) DEFAULT '0.00',
  `min_stock` int DEFAULT '0',
  `status` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'SP001','Coca Cola',1,'Lon',7000.00,10000.00,20,1,'2026-09-25 22:52:10'),(2,'SP002','Pepsi',1,'Lon',7000.00,10000.00,20,1,'2026-09-25 22:52:10'),(3,'SP003','Sting',1,'Chai',6000.00,9000.00,15,1,'2026-09-25 22:52:10'),(4,'SP004','Mì Hảo Hảo',2,'Gói',3500.00,5000.00,30,1,'2026-09-25 22:52:10'),(5,'SP005','Nước rửa chén',3,'Chai',18000.00,25000.00,10,1,'2026-09-25 22:52:10'),(9,'SP006','Bàn phím',6,'Cái',500000.00,550000.00,100,1,'2026-10-03 23:19:20'),(10,'SP007','Móc khóa thú bông',7,'Cái',10000.00,12000.00,199,1,'2026-10-03 23:23:37');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị hệ thống'),(2,'MANAGER','Quản lý kho'),(3,'STAFF','Thủ kho');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocktake_details`
--

DROP TABLE IF EXISTS `stocktake_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocktake_details` (
  `stocktake_detail_id` int NOT NULL AUTO_INCREMENT,
  `stocktake_id` int NOT NULL,
  `product_id` int NOT NULL,
  `system_quantity` int NOT NULL,
  `actual_quantity` int NOT NULL,
  `difference` int GENERATED ALWAYS AS ((`actual_quantity` - `system_quantity`)) STORED,
  PRIMARY KEY (`stocktake_detail_id`),
  KEY `stocktake_id` (`stocktake_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `stocktake_details_ibfk_1` FOREIGN KEY (`stocktake_id`) REFERENCES `stocktakes` (`stocktake_id`),
  CONSTRAINT `stocktake_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocktake_details`
--

LOCK TABLES `stocktake_details` WRITE;
/*!40000 ALTER TABLE `stocktake_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `stocktake_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocktakes`
--

DROP TABLE IF EXISTS `stocktakes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocktakes` (
  `stocktake_id` int NOT NULL AUTO_INCREMENT,
  `stocktake_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` int NOT NULL,
  `user_id` int NOT NULL,
  `stocktake_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('DRAFT','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`stocktake_id`),
  UNIQUE KEY `stocktake_code` (`stocktake_code`),
  KEY `warehouse_id` (`warehouse_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stocktakes_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  CONSTRAINT `stocktakes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocktakes`
--

LOCK TABLES `stocktakes` WRITE;
/*!40000 ALTER TABLE `stocktakes` DISABLE KEYS */;
/*!40000 ALTER TABLE `stocktakes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `supplier_code` (`supplier_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'NCC001','Công ty TNHH ABC','0900000011','abc@gmail.com','Cần Thơ',1),(2,'NCC002','Công ty TNHH ZXY','0900000012','ZXY@gmail.com','TP. Hồ Chí Minh',1);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','scrypt$a2dafcb8b776fac48f7e093e79e2bbb2$c101cfb824ebf6deebecf2746b94e8f1e7f2cc58294761e79874bf7673d03fd4310d1a6d59a08d42c792b92f11c4bc450bdc0ba3a64774b771944a106d871d4f','Quản trị viên','0900000001','admin@inotrack.com',1,1,'2026-09-25 22:52:10'),(2,'manager','scrypt$6f29268f700bb1d301efd6613f2c16ac$426b59dddd420275ba7471f1bec1b0bc7b988f1738f15ea39a6b220f8d075081f1433d1255a2eef1a69dca54d623ea2fac5bd4908186a5b41e1d31f0ac92729f','Nguyễn Văn Quản','0900000002','manager@inotrack.com',2,1,'2026-09-25 22:52:10'),(3,'staff','scrypt$4a587afca971a6a0988593f98d270b50$3c529e5b66f54ea53c9d3737baa20ccbe4b1dc6208a9c53e36c1523c3f4133bea55186a9bfb8ca1a2c4c1417ff6e29739448c0f9988091658ca56f891fe9c433','Trần Văn Thủ','0900000003','staff@inotrack.com',3,1,'2026-09-25 22:52:10'),(5,'nhanvien2','scrypt$d3edb04d558fb3142225822dd4dc85ff$74708a93834c6af68cf7b9bf010684f22537062aa4df606cecfd82f71e3019eba217f7ca7ba67cfd43fb8685c96f3d55814c1f10e2d7251c4e24951289d0f94e','Vinh','0838644417','vinhhuynh5a2@gmail.com',3,1,'2026-10-01 22:24:42');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `warehouse_id` int NOT NULL AUTO_INCREMENT,
  `warehouse_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'Kho chính','Cần Thơ',1);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-04  0:01:18
