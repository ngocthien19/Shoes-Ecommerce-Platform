-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: shoes
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `image` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Giày Sneaker','giay-sneaker','Giày thể thao năng động, thời trang',NULL,1,'2026-05-25 14:16:24'),(2,NULL,'Giày Cao Gót','giay-cao-got','Dành cho các buổi tiệc và công sở',NULL,1,'2026-05-25 14:16:24'),(3,NULL,'Giày Tây Nam','giay-tay-nam','Sang trọng, lịch lãm cho phái mạnh',NULL,1,'2026-05-25 14:16:24'),(4,NULL,'Dép & Sandals','dep-and-sandals','Thoải mái, tiện lợi đi hàng ngày',NULL,1,'2026-05-25 14:16:24'),(5,NULL,'Phụ Kiện Giày','phu-kien-giay','Vớ, lót giày, bộ vệ sinh giày',NULL,1,'2026-05-25 14:16:24'),(6,1,'Sneaker Chạy Bộ (Running)','sneaker-chay-bo-running','Giày sneaker tối ưu cho chạy bộ thể thao, đệm êm.',NULL,1,'2026-05-25 14:19:43'),(7,1,'Sneaker Bóng Rổ','sneaker-bong-ro','Giày cổ cao, bảo vệ cổ chân chuyên dụng bóng rổ.',NULL,1,'2026-05-25 14:19:43'),(8,1,'Sneaker Thời Trang (Casual)','sneaker-thoi-trang-casual','Các mẫu sneaker quốc dân đi học, đi chơi hàng ngày.',NULL,1,'2026-05-25 14:19:43'),(9,2,'Giày Cao Gót Mũi Nhọn','giay-cao-got-mui-nhon','Thiết kế thanh lịch, hack dáng cho quý cô công sở.',NULL,1,'2026-05-25 14:19:43'),(10,2,'Sandal Cao Gót','sandal-cao-got','Sandal cao gót quai mảnh thoáng chân, đi tiệc.',NULL,1,'2026-05-25 14:19:43'),(11,3,'Giày Oxford / Derby','giay-oxford-derby','Mẫu giày tây buộc dây cổ điển chuẩn quý ông.',NULL,1,'2026-05-25 14:19:43'),(12,3,'Giày Lười (Loafers)','giay-luoi-loafers','Giày tây xỏ chân tiện lợi, trẻ trung lịch lãm.',NULL,1,'2026-05-25 14:19:43'),(13,4,'Sandal Quai Ngang','sandal-quai-ngang','Sandal học sinh, sinh viên năng động bền bỉ.',NULL,1,'2026-05-25 14:19:43'),(14,4,'Dép Lê Thời Trang','dep-le-thoi-trang','Dép lê quai ngang đúc nguyên khối tiện lợi.',NULL,1,'2026-05-25 14:19:43'),(15,NULL,'Giày Đá Banh','giay-da-banh','Mẫu giày đinh dăm TF, đinh cao FG chuyên dụng','{\"public_id\": \"shoes_categories/h7p12ybsjgnbn9ztag7q\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779719242/shoes_categories/h7p12ybsjgnbn9ztag7q.jpg\"}',1,'2026-05-25 14:27:23');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`store_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,7,2,'2026-05-29 12:15:55','2026-05-29 12:15:55');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (6,1),(7,1),(7,2);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_colors`
--

DROP TABLE IF EXISTS `global_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color_name` varchar(50) NOT NULL,
  `color_code` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `color_name` (`color_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_colors`
--

LOCK TABLES `global_colors` WRITE;
/*!40000 ALTER TABLE `global_colors` DISABLE KEYS */;
INSERT INTO `global_colors` VALUES (1,'Đen (Black)','#000000','2026-05-25 13:51:14'),(2,'Trắng (White)','#FFFFFF','2026-05-25 13:51:14'),(3,'Đỏ (Red)','#DC2626','2026-05-25 13:51:14'),(4,'Xanh Dương (Blue)','#2563EB','2026-05-25 13:51:14'),(5,'Xám (Grey)','#4B5563','2026-05-25 13:51:14'),(6,'Hồng (Pink)','#EC4899','2026-05-25 13:51:14'),(7,'Vàng (Yellow)','#EAB308','2026-05-25 13:51:14');
/*!40000 ALTER TABLE `global_colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_sizes`
--

DROP TABLE IF EXISTS `global_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size_value` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `size_value` (`size_value`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_sizes`
--

LOCK TABLES `global_sizes` WRITE;
/*!40000 ALTER TABLE `global_sizes` DISABLE KEYS */;
INSERT INTO `global_sizes` VALUES (1,'35','2026-05-25 13:50:39'),(2,'36','2026-05-25 13:50:39'),(3,'37','2026-05-25 13:50:39'),(4,'38','2026-05-25 13:50:39'),(5,'39','2026-05-25 13:50:39'),(6,'40','2026-05-25 13:50:39'),(7,'41','2026-05-25 13:50:39'),(8,'42','2026-05-25 13:50:39'),(9,'43','2026-05-25 13:50:39'),(10,'44','2026-05-25 13:50:39'),(11,'45','2026-05-25 13:50:39');
/*!40000 ALTER TABLE `global_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text,
  `images` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,7,'Shop ơi giày này còn size 42 không?','[{\"public_id\": \"shoes_store_chats/w4n3ak3vduflccxj3r5h\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780056953/shoes_store_chats/w4n3ak3vduflccxj3r5h.jpg\"}]',0,'2026-05-29 12:15:55');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (17,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:29:47'),(18,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:29:47'),(19,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo bị bác bỏ. Đánh giá của khách hàng thien vẫn hiển thị bình thường.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,0,'2026-05-29 19:36:18'),(20,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:38:50'),(21,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:38:50'),(22,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo bị bác bỏ. Đánh giá của khách hàng thien vẫn hiển thị bình thường.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,0,'2026-05-29 19:39:19'),(23,10,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:50:49'),(24,11,'Có đơn tố cáo đánh giá mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa báo cáo vi phạm đối với 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REPORTED',2,0,'2026-05-29 19:50:49'),(25,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Đơn tố cáo thành công. Hệ thống đã ẩn đánh giá của khách hàng thien.\",\"image\":\"\"}','REVIEW_RESOLVED_BANNED',6,0,'2026-05-29 19:51:20'),(26,10,'Yêu cầu mở lại đánh giá bị ẩn','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa xin mở lại 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REOPEN_REQUESTED',2,0,'2026-05-29 19:52:00'),(27,11,'Yêu cầu mở lại đánh giá bị ẩn','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa xin mở lại 1 đánh giá.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','REVIEW_REOPEN_REQUESTED',2,0,'2026-05-29 19:52:00'),(28,6,'Kết quả giải quyết khiếu nại','{\"message\":\"Yêu cầu thành công. Đánh giá của khách hàng thien đã được khôi phục.\",\"image\":\"\"}','REVIEW_RESOLVED_APPROVED',6,0,'2026-05-29 19:52:07'),(29,1,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 1.000.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_REQUESTED',2,0,'2026-05-29 20:18:44'),(30,13,'Yêu cầu rút tiền mới','{\"message\":\"Gian hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa đặt lệnh rút 1.000.000 VNĐ.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_REQUESTED',2,0,'2026-05-29 20:18:44'),(31,6,'Lệnh rút tiền thành công','{\"message\":\"Lệnh rút 1.000.000 VNĐ đã được xử lý hoàn tất.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','PAYOUT_APPROVED',2,0,'2026-05-29 20:19:28'),(32,1,'Yêu cầu cứu xét cửa hàng','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_REQUESTED',2,0,'2026-05-29 20:30:04'),(33,13,'Yêu cầu cứu xét cửa hàng','{\"message\":\"Cửa hàng \\\"Sneaker World Siêu Cấp Vip Pro\\\" vừa nộp đơn khiếu nại xin khôi phục hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_REQUESTED',2,0,'2026-05-29 20:30:04'),(34,6,'Khôi phục cửa hàng thành công','{\"message\":\"Chúc mừng! Cửa hàng của bạn đã được khôi phục trạng thái hoạt động.\",\"image\":\"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','APPEAL_APPROVED',3,0,'2026-05-29 20:30:50');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,3,1,2,3500000.00),(2,4,1,3,3500000.00),(3,5,1,4,3500000.00),(9,9,4,1,1950000.00),(10,9,5,2,1950000.00),(14,12,4,1,1950000.00),(20,18,4,1,1950000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `store_id` int DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `commission_rate_snapshot` decimal(5,2) NOT NULL DEFAULT '10.00',
  `shipping_address` text NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','cancel_requested') DEFAULT 'pending',
  `cancel_reason` text,
  `payment_status` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT 'COD',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,4,'','',1,3500000.00,0.00,10.00,'123 Đường ABC, Linh Trung, Thủ Đức, TP.HCM','delivered',NULL,'paid','COD','2026-05-19 03:59:28'),(2,4,'','',1,3500000.00,0.00,10.00,'123 Đường ABC, Linh Trung, Thủ Đức, TP.HCM','delivered',NULL,'paid','COD','2026-05-19 04:00:18'),(3,6,'','',1,7000000.00,0.00,10.00,'Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','delivered',NULL,'paid','COD','2026-05-20 07:36:03'),(4,6,'','',1,10500000.00,0.00,10.00,'Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','cancelled',NULL,'unpaid','COD','2026-05-20 08:24:43'),(5,7,'','',2,14000000.00,0.00,10.00,'Số 134 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','cancelled','Người mua không còn nhu cầu','unpaid','COD','2026-05-21 06:00:03'),(9,7,'','',2,5850000.00,0.00,10.00,'Số 134 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. Hồ Chí Minh','delivered',NULL,'paid','COD','2026-05-25 17:23:54'),(12,7,'Trần Thanh Toán','0987654321',2,1950000.00,0.00,10.00,'1 Võ Văn Ngân, Thủ Đức, TP.HCM','processing',NULL,'paid','VNPAY','2026-06-01 09:58:26'),(18,7,'Trần MoMo','0987654321',2,1950000.00,0.00,10.00,'123 Đường Dân Chủ, Thủ Đức, TP.HCM','processing',NULL,'paid','MOMO','2026-06-01 10:44:19');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payout_requests`
--

DROP TABLE IF EXISTS `payout_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_name` varchar(150) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `payout_requests_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payout_requests`
--

LOCK TABLES `payout_requests` WRITE;
/*!40000 ALTER TABLE `payout_requests` DISABLE KEYS */;
INSERT INTO `payout_requests` VALUES (1,2,2000000.00,'Vietcombank','0071001234567','NGUYEN VAN A','approved','Đã chuyển khoản thành công qua Vietcombank Bank - Mã GD: MB888999','2026-05-25 17:57:18','2026-05-25 17:59:40'),(2,2,1000000.00,'Vietcombank','0071001234567','NGUYEN VAN A','approved','Đã chuyển khoản thành công qua MB Bank - Mã GD: MB999999','2026-05-29 20:18:44','2026-05-29 20:19:28');
/*!40000 ALTER TABLE `payout_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_promotions`
--

DROP TABLE IF EXISTS `product_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_promotions` (
  `product_id` int NOT NULL,
  `promotion_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`promotion_id`),
  KEY `promotion_id` (`promotion_id`),
  CONSTRAINT `product_promotions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_promotions_ibfk_2` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_promotions`
--

LOCK TABLES `product_promotions` WRITE;
/*!40000 ALTER TABLE `product_promotions` DISABLE KEYS */;
INSERT INTO `product_promotions` VALUES (1,1),(3,1);
/*!40000 ALTER TABLE `product_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_reported` tinyint(1) DEFAULT '0',
  `report_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,4,1,1,5,'Giày quá đẹp, check chuẩn real, shop đóng gói rất kỹ có cả double box',NULL,1,0,NULL,'2026-05-19 04:00:21'),(2,4,1,1,4,'Hàng đẹp nhưng giao hàng hơi chậm tí, 4 sao khuyến khích.',NULL,1,0,'Khách hàng này cố tình bôi nhọ, sử dụng từ ngữ xúc phạm danh dự cửa hàng và spam số điện thoại lừa đảo kéo khách ra ngoài sàn.','2026-05-19 04:00:21'),(3,4,8,1,5,'Dép đi như trên mây vậy, rất đáng tiền',NULL,1,0,NULL,'2026-05-19 04:00:21'),(4,6,1,3,5,'Giày đẹp xuất sắc pro ơi, da lộn xịn đét đi êm chân cực kỳ luôn!','[]',1,0,'Khách hàng cố tình bôi nhọ, sử dụng từ ngữ xúc phạm danh dự cửa hàng và spam số điện thoại lừa đảo kéo khách ra ngoài sàn.','2026-05-20 12:57:18'),(5,6,1,3,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[]',1,0,'Khách hàng spam đánh giá, bình luận bôi nhọ sản phẩm không đúng sự thật.','2026-05-20 13:02:27'),(6,7,1,3,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[]',1,0,'Chúng tôi đã liên hệ đền bù và tặng voucher cho khách, khách đã đồng ý đổi ý định gỡ bài ẩn nhe Manager.','2026-05-20 13:03:47'),(7,7,8,NULL,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!','[{\"public_id\": \"shoes_store_reviews/ux2afi079gtldqlxbjmh\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779566713/shoes_store_reviews/ux2afi079gtldqlxbjmh.jpg\"}]',1,0,'Khách hàng spam đánh giá, bình luận bôi nhọ sản phẩm không đúng sự thật.','2026-05-23 20:05:14');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `size` varchar(20) NOT NULL,
  `color` varchar(50) NOT NULL,
  `stock` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'39','Panda Black White',1),(2,1,'40','Panda Black White',14),(3,1,'41','Panda Black White',0),(4,8,'40','Bone',18),(5,8,'41','Bone',25);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `sold` int DEFAULT '0',
  `rating_avg` decimal(3,2) DEFAULT '0.00',
  `view_count` int DEFAULT '0',
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `status` varchar(50) DEFAULT 'approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `store_id` (`store_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,1,'Nike Air Jordan 1 Low','nike-air-jordan-1-low','Phối màu Panda kinh điển',3500000.00,90,4.80,1,NULL,1,'approved','2026-05-19 03:58:37','2026-05-25 16:07:51'),(2,2,1,'Adidas Forum Low White','adidas-forum-low-white','Phong cách retro thập niên 80',2100000.00,35,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-24 08:24:10'),(3,2,1,'New Balance 550 Blue','new-balance-550-blue','Sự kết hợp hoàn hảo thể thao thời trang',3200000.00,20,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-24 08:24:10'),(4,2,2,'Biti’s Hunter Heels','bitis-hunter-heels','Êm ái, tôn dáng cho phái đẹp',750000.00,120,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-24 08:24:10'),(5,2,2,'Stiletto Cao Gót 9cm','stiletto-cao-got-9cm','Màu đỏ mận quý phái, gót nhọn',1200000.00,15,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-24 08:24:30'),(6,2,3,'Oxford Classic Leather','oxford-classic-leather','Da bò thật nguyên tấm, khâu tay',1850000.00,5,5.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-21 04:54:17'),(7,2,3,'Chelsea Boot Suede','chelsea-boot-suede','Da lộn màu nâu đất, phong cách bụi bặm',1600000.00,45,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-21 04:54:17'),(8,2,4,'Dép Yeezy Slide Bone','dep-yeezy-slide-bone','Chất liệu bọt EVA siêu nhẹ, cực êm',1950000.00,227,5.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-06-01 10:44:19'),(9,2,4,'Sandals Quai Hậu Học Sinh','sandals-quai-hau-hoc-sinh','Thiết kế đơn giản, bền bỉ',250000.00,500,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-21 04:54:17'),(10,2,5,'Bộ vệ sinh giày Jason Markk','bo-ve-sinh-giay-jason-markk','Làm sạch mọi vết bẩn cứng đầu',450000.00,1000,0.00,0,NULL,1,'approved','2026-05-19 03:58:37','2026-05-21 04:54:17'),(16,2,1,'Giày Nike Air Jordan 1 High Travis Scott','giay-nike-air-jordan-1-high-travis-scott-1780057167369','Phiên bản giới hạn cổ cao, chất liệu da lộn, phối màu nâu đen cá tính.',4500000.00,0,0.00,0,'[]',1,'approved','2026-05-29 12:19:27','2026-05-29 12:20:16'),(19,2,1,'Giày Nike Air Jordan 1 High Travis Scott','giay-nike-air-jordan-1-high-travis-scott-1780080590496','Phiên bản giới hạn cổ cao, chất liệu da lộn, phối màu nâu đen cá tính.',4500000.00,0,0.00,0,'[{\"public_id\": \"shoes_store_products/d72oma5out0ezouxmo4h\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780080588/shoes_store_products/d72oma5out0ezouxmo4h.jpg\"}]',0,'rejected','2026-05-29 18:49:50','2026-05-29 18:51:26');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,1,'CLEARANCE SALE - GIÀY CHÍNH HÃNG',NULL,30.00,0.00,500000.00,'2026-05-13 00:00:00','2026-06-13 23:59:59',1,'2026-05-19 03:59:23','2026-05-19 03:59:23'),(2,NULL,'GIAM_GIA_HE','Mã giảm giá chào hè 2026 áp dụng toàn sàn',50000.00,200000.00,50000.00,'2026-01-01 00:00:00','2026-12-31 23:59:59',1,'2026-05-20 13:41:55','2026-05-20 13:41:55'),(3,1,'NIKE_VIP_100K','Mã giảm giá tri ân khách hàng của Nike Store',100000.00,500000.00,100000.00,'2026-01-01 00:00:00','2026-12-31 23:59:59',1,'2026-05-20 13:42:45','2026-05-20 13:42:45'),(7,2,'FLASHSALE25','Mã giảm giá cực sâu 25% áp dụng cho toàn bộ các dòng sản phẩm giày Sneaker dịp hè 2026.',25.00,600000.00,150000.00,'2026-06-01 00:00:00','2026-06-15 00:00:00',1,'2026-05-23 19:03:14','2026-05-23 19:03:14'),(8,2,'FLASHSALE30','Mã giảm giá cực sâu 30% áp dụng cho toàn bộ các dòng sản phẩm giày Sneaker dịp hè 2026.',30.00,600000.00,150000.00,'2026-06-01 00:00:00','2026-06-15 00:00:00',1,'2026-05-23 19:13:03','2026-05-23 19:13:03');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'MANAGER'),(4,'USER'),(3,'VENDOR');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_appeals`
--

DROP TABLE IF EXISTS `store_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_appeals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `appeal_reason` text NOT NULL,
  `evidence_images` json DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `manager_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `store_appeals_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_appeals`
--

LOCK TABLES `store_appeals` WRITE;
/*!40000 ALTER TABLE `store_appeals` DISABLE KEYS */;
INSERT INTO `store_appeals` VALUES (1,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/rjxmigex5m4fpz5zaf3z\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779714094/shoes_store_appeals/rjxmigex5m4fpz5zaf3z.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-25 13:01:35','2026-05-25 13:04:13'),(2,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/bszlhb2oe8gpccnil4lt\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779716378/shoes_store_appeals/bszlhb2oe8gpccnil4lt.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-25 13:39:39','2026-05-25 13:40:22'),(3,2,'Tôi xin cam kết gỡ bỏ toàn bộ mẫu giày Nike fake ra khỏi cửa hàng, mong ban quản trị mở lại shop.','[{\"public_id\": \"shoes_store_appeals/moux5rw32xbnc2cxfivh\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780086603/shoes_store_appeals/moux5rw32xbnc2cxfivh.jpg\"}]','approved','Hồ sơ hóa đơn đối soát chính hãng hợp lệ. Cảnh cáo Vendor không được tái phạm đăng bán sản phẩm không rõ nguồn gốc.','2026-05-29 20:30:04','2026-05-29 20:30:50');
/*!40000 ALTER TABLE `store_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_reviews`
--

DROP TABLE IF EXISTS `store_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `store_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_reported` tinyint(1) DEFAULT '0',
  `report_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `store_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `store_reviews_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `store_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_reviews`
--

LOCK TABLES `store_reviews` WRITE;
/*!40000 ALTER TABLE `store_reviews` DISABLE KEYS */;
INSERT INTO `store_reviews` VALUES (1,4,2,5,'Shop tư vấn size rất nhiệt tình, đổi trả cực nhanh.',1,0,NULL,'2026-05-19 04:00:26'),(2,4,2,5,'Hàng chính hãng, full box, tặng kèm cả tất!',1,0,NULL,'2026-05-19 04:00:26'),(3,4,2,4,'Chất lượng sản phẩm tốt nhưng shipper giao hơi muộn.',1,0,NULL,'2026-05-19 04:00:26'),(4,6,2,5,'Chủ shop tư vấn size siêu nhiệt tình, đóng gói kỹ càng, 10 điểm không có nhưng!',1,0,NULL,'2026-05-20 13:05:42');
/*!40000 ALTER TABLE `store_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `bio` text,
  `logo` json DEFAULT NULL,
  `banner` json DEFAULT NULL,
  `address` text,
  `balance` decimal(15,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `rating_average` decimal(3,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00' COMMENT 'Tỷ lệ % chiết khấu hoa hồng sàn thu trên mỗi đơn hàng thành công',
  PRIMARY KEY (`id`),
  UNIQUE KEY `owner_id` (`owner_id`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,3,'Sneaker World','Chuyên cung cấp giày chính hãng',NULL,NULL,NULL,5000000.00,1,4.75,'2026-05-19 03:58:28',10.00),(2,6,'Sneaker World Siêu Cấp Vip Pro','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas, Jordan uy tín số 1.','{\"public_id\": \"shoes_store_profiles/mverplensfizmdevdocv\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331199/shoes_store_profiles/mverplensfizmdevdocv.webp\"}','{\"public_id\": \"shoes_store_profiles/seja4lyebrqpfvgbojue\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779331201/shoes_store_profiles/seja4lyebrqpfvgbojue.jpg\"}','456 Đường Lê Văn Việt, Phường Tăng Nhơn Phú A, Thành phố Thủ Đức, TP.HCM',2411250.00,1,0.00,'2026-05-21 02:40:02',10.00),(3,9,'Sneaker World Premium (nhuy2005)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số 2.',NULL,NULL,'789Đường Lê Văn Việt, Phường Tăng Nhơn Phú B, Thành phố Thủ Đức, TP.HCM',0.00,1,0.00,'2026-05-23 11:26:44',10.00),(4,8,'Sneaker World Premium (nhuyq)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số e.','{\"public_id\": \"shoes_store_profiles/nekvjcihcbffbppgfffb\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779536032/shoes_store_profiles/nekvjcihcbffbppgfffb.jpg\"}','{\"public_id\": \"shoes_store_profiles/hpqlbmu5gdkjwwfjoont\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779536031/shoes_store_profiles/hpqlbmu5gdkjwwfjoont.jpg\"}','789 Đường Lê Văn Vân, Phường Tăng Nhơn Phú B, Thành phố Thủ Đức, TP.HCM',0.00,1,0.00,'2026-05-23 11:33:52',10.00),(6,12,'Sneaker World Premium (huu)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số n.','{\"public_id\": \"shoes_store_profiles/j5ofealt3qkesclvagat\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779540934/shoes_store_profiles/j5ofealt3qkesclvagat.jpg\"}','{\"public_id\": \"shoes_store_profiles/chgiiduuqnmpehfz0mkd\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779540934/shoes_store_profiles/chgiiduuqnmpehfz0mkd.jpg\"}','Quận Thủ Đức 1',0.00,1,0.00,'2026-05-23 12:55:35',10.00),(11,17,'Sneaker World Premium (tesst1)','Chuyên phân phối các dòng giày Sneaker chính hãng Nike, Adidas số n.','{\"public_id\": \"shoes_store_profiles/uzn8nkmxcsw4iav4vctu\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780081244/shoes_store_profiles/uzn8nkmxcsw4iav4vctu.jpg\"}','{\"public_id\": \"shoes_store_profiles/uiaot2cayvdglsqec4ay\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780081243/shoes_store_profiles/uiaot2cayvdglsqec4ay.jpg\"}','Quận Thủ Đức 3',0.00,1,0.00,'2026-05-29 19:00:46',10.00);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL DEFAULT '1',
  `is_maintenance` tinyint(1) DEFAULT '0',
  `maintenance_message` text,
  `global_commission_rate` decimal(5,2) DEFAULT '10.00',
  `hotline` varchar(20) DEFAULT '19001000',
  `support_email` varchar(100) DEFAULT 'support@shoesshop.com',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `check_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,0,'Sàn bảo trì nâng cấp hệ thống',10.00,'19001000','admin@shoesshop.com','2026-05-26 02:12:44','2026-05-26 03:45:57');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `refresh_token` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_online` tinyint(1) DEFAULT '0',
  `last_active` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Tổng Quản Trị','admin@gmail.com','hash_pass_123','0123456789',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(2,3,'Quản Lý Hệ Thống','manager@gmail.com','hash_pass_123','0987654321',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(3,3,'Chủ Shop Sneaker','vendor_giay@gmail.com','hash_pass_123','0911223344',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(4,4,'Nguyễn Văn Khách','khachhang@gmail.com','hash_pass_123','0900112233',NULL,NULL,1,1,NULL,NULL,NULL,'2026-05-19 03:58:25',0,'2026-05-29 11:10:52'),(6,3,'Ngọc Thiên','caongocthien1902@gmail.com','$2b$08$RM8s23Ro0IByZV7Ia.7gv.hRVsRPthf/1d2NL9u7q0JP5WDJd/7vG','0912347778','99 Lê Đại Hành, Phường 11, Quận 11, TP. HCM','{\"public_id\": \"shoes_store_avatars/twcwkui0gssygokbnw1m\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1779202100/shoes_store_avatars/twcwkui0gssygokbnw1m.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJjYW9uZ29jdGhpZW4xOTAyQGdtYWlsLmNvbSIsInJvbGVJZCI6MywiaWF0IjoxNzgwMDg1ODk3LCJleHAiOjE3ODEyOTU0OTd9.3ybSXoZmiSthq9DAdu5tSOcquomjrVXt2t3igVN3txM','2026-05-19 12:08:23',0,'2026-05-29 20:30:58'),(7,4,'thien','23110332@student.hcmute.edu.vn','$2b$10$SGX834KV71/ROrBKcQf0AuZ0HFm6zlva05aMQQAw9U4nx/nwB4aCG','0987654321','31 Đống Đa, Phường 12, Quận Tân Bình, TP. HCM',NULL,1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiIyMzExMDMzMkBzdHVkZW50LmhjbXV0ZS5lZHUudm4iLCJyb2xlSWQiOjQsImlhdCI6MTc4MDMxMDEyMCwiZXhwIjoxNzgxNTE5NzIwfQ.mBS2pFMpJX1WypnjzarihrU40T1_-7em0yHjcvcoSqo','2026-05-21 05:55:31',0,'2026-05-29 12:18:33'),(8,3,'nhuy','nhuyhay1@gmail.com','$2b$10$/udRZo/OlKnDGZ7kYpWLyOcbNRmWBR4GGgBGOtcaHZMhZnfB8Ebsa','0987654321','31 Đống Đa, Phường 12, Quận Thủ Đức, TP. HCM',NULL,1,1,NULL,NULL,NULL,'2026-05-23 11:23:44',0,'2026-05-29 11:10:52'),(9,3,'nhuy','nhuyhay2005@gmail.com','$2b$10$lQEVQuhudIh44wDv1EYjjuztV6.EwygGE8kdHX8uIAXov9fABgC26','0987654321','31 Đống Đa, Phường 12, Quận Thủ Đức, TP. HCM',NULL,1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJuaHV5aGF5MjAwNUBnbWFpbC5jb20iLCJyb2xlSWQiOjQsImlhdCI6MTc3OTUzNTQ5NywiZXhwIjoxNzgwNzQ1MDk3fQ.bgdeD8E03EcwkNvtrH8RAZuiqhZScs97UHVX7AfN5DI','2026-05-23 11:24:32',0,'2026-05-29 11:10:52'),(10,2,'Manager 1','manager1@gmail.com','$2b$10$AzR7yD8bZ2mOm0CefmXpG.Z7MdB7UoKj4D3QvZ9gqYm6Y9H6hK2gq','0987654321',NULL,'{\"public_id\": \"avatars/manager_default\", \"secure_url\": \"https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg\"}',1,1,NULL,NULL,NULL,'2026-05-23 11:38:29',0,'2026-05-29 11:10:52'),(11,2,'Manager Ý','23521843@gm.uit.edu.vn','$2b$10$iHog8Ft12XKoDeswZh9cr.5wE4.k3MsJHePNHdMNITMLNgf/cApvq','0987654321','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM',NULL,1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImVtYWlsIjoiMjM1MjE4NDNAZ20udWl0LmVkdS52biIsInJvbGVJZCI6MiwiaWF0IjoxNzgwMDgzNDAyLCJleHAiOjE3ODEyOTMwMDJ9.1GOt93W1k3fXPMdSNLf-MOPcQtJc6dsh3-3Uzga5uJI','2026-05-23 11:39:59',1,'2026-05-29 19:01:57'),(12,3,'Manager Ý','ngochuunaksss@gmail.com','$2b$10$aPSveGIQgHhlrQp7fgWBqe12otG6Q5kwVcZTSvPJ8xPLOsSWZ0Ev.','0987654321','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM',NULL,1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibmdvY2h1dW5ha3Nzc0BnbWFpbC5jb20iLCJyb2xlSWQiOjQsImlhdCI6MTc3OTU0MDM5NiwiZXhwIjoxNzgwNzQ5OTk2fQ.ociyRl3fnhbB6JUuJuXZRZzjDm5J45tLW13IwH8XyVw','2026-05-23 12:03:42',0,'2026-05-29 11:10:52'),(13,1,'Admin Toan','23110345@student.hcmute.edu.vn','$2b$10$/sXggYqGS3Wr.3vChX0XFutjViVorWmObGAqzkFC1z/5cDYAwALYm','0987654321','31 Đống Đa, Phường 1, Quận Thủ Đức, TP. HCM',NULL,1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImVtYWlsIjoiMjMxMTAzNDVAc3R1ZGVudC5oY211dGUuZWR1LnZuIiwicm9sZUlkIjoxLCJpYXQiOjE3ODAwODU3NzAsImV4cCI6MTc4MTI5NTM3MH0.QPvEBcUEQr3yKqaiwaVvR7LgVZUnE2LTUV0TFLhmivQ','2026-05-25 06:36:59',0,'2026-05-29 20:30:58'),(17,3,'User1','user1@gmail.com','$2b$08$rPVENyWerX/FBIfQeVCxte3U3CDB7DU39bhnKPHvJImKJ.VjV/tL.','0911223344',NULL,'{\"public_id\": \"shoes_store_avatars/tlpa2qh2pb5fvq1rouhs\", \"secure_url\": \"https://res.cloudinary.com/dkat9o7kf/image/upload/v1780081197/shoes_store_avatars/tlpa2qh2pb5fvq1rouhs.jpg\"}',1,1,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoidXNlcjFAZ21haWwuY29tIiwicm9sZUlkIjo0LCJpYXQiOjE3ODAwODEyMDcsImV4cCI6MTc4MTI5MDgwN30.ovnz9pCdm61RUTgZU-DdHHkQPZDS6r1yVD6s69L4-gw','2026-05-29 18:59:59',0,'2026-05-29 19:01:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-01 18:41:37
