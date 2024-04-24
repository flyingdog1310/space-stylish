-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: stylish
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

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

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `story` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,1,'images/1677678219737-8333-iss_campaign.jpg','縮排成這樣\r\n這哪是Prettier\r\n分明是Uglier\r\n-Sam-2023','2023-03-01 13:43:39');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (1,1,'images/1677678136683-5495-earth.jpg'),(2,1,'images/1677678136683-1634-space.jpg'),(3,1,'images/1677678136684-5722-universe.jpg'),(4,2,'images/1677678347729-1870-earth.jpg'),(5,2,'images/1677678347729-8401-space.jpg'),(6,2,'images/1677678347730-1552-universe.jpg'),(7,3,'images/1677678490270-7521-earth.jpg'),(8,3,'images/1677678490271-8153-space.jpg'),(9,3,'images/1677678490272-5271-universe.jpg'),(10,4,'images/1677678595431-159-earth.jpg'),(11,4,'images/1677678595431-9551-space.jpg'),(12,4,'images/1677678595432-4107-universe.jpg'),(13,5,'images/1677678739983-3635-earth.jpg'),(14,5,'images/1677678739983-8349-space.jpg'),(15,5,'images/1677678739984-2046-universe.jpg'),(16,6,'images/1677678920355-601-earth.jpg'),(17,6,'images/1677678920356-6577-space.jpg'),(18,6,'images/1677678920357-6039-universe.jpg');
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_lists`
--

DROP TABLE IF EXISTS `order_lists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `price` decimal(28,0) DEFAULT NULL,
  `color_name` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `color_code` varchar(8) DEFAULT NULL,
  `size` varchar(8) DEFAULT NULL,
  `qty` smallint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_lists_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_lists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lists`
--

LOCK TABLES `order_lists` WRITE;
/*!40000 ALTER TABLE `order_lists` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_lists` ENABLE KEYS */;
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
  `shipping` varchar(32) DEFAULT NULL,
  `payment` varchar(32) DEFAULT NULL,
  `subtotal` decimal(28,0) DEFAULT NULL,
  `freight` decimal(26,0) DEFAULT NULL,
  `total` decimal(28,0) DEFAULT NULL,
  `name` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `phone` varchar(16) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `time` varchar(16) DEFAULT NULL,
  `rec_trade_id` varchar(255) DEFAULT NULL,
  `status` varchar(16) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(16) DEFAULT NULL,
  `title` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `price` decimal(28,0) DEFAULT NULL,
  `texture` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `wash` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `place` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `note` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `story` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `main_image` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'women','International Space Station','國際太空站，是一個在近地軌道上運行的科研設施，是人類歷史上第九個載人的太空站。',3049950000000,'金屬','太陽射線清洗','美國','號稱史上最貴的人類造物','人類歷史的偉大篇章，值得您紀念','images/1677678136682-1681-iss_main.jpg','2023-03-01 13:42:16'),(2,'women','16 Psyche','靈神星（16 Psyche）為一顆巨大的小行星，也很有可能是最大的M-型小行星',21339010000000000000000,'金屬','太陽射線清洗','宇宙','號稱宇宙中最昂貴的星體','宇宙中最貴的星體，值得您擁有','images/1677678347728-1297-16Psyche_main.jpg','2023-03-01 13:45:47'),(3,'women','Mir Space Station','和平號太空站是前蘇聯建造的一個模組軌道太空站，蘇聯解體後歸屬俄羅斯。',122126000000,'金屬','太陽射線清洗','蘇聯','原本建造它的國家已然不在，它仍屹立不搖','比起國際太空站便宜不少，預算有限的選擇','images/1677678490269-5927-mirss_main.jpg','2023-03-01 13:48:10'),(4,'women','Tiangong Space Station','天宮太空站是中國從2021年開始建設的一個模組化太空站系統，為人類自1986年的和平號太空站及1998年的國際太空站後所建造的第三座大型在軌空間實驗平台。',244085600000,'金屬','太陽射線清洗','中國','後起的新太空站，價值仍在持續增加中','新的更好，還是舊的更穩定，有待時間來驗證','images/1677678595430-4820-tiangongss_main.jpg','2023-03-01 13:49:55'),(5,'women','Hubble Space Telescope','哈伯太空望遠鏡，是以天文學家愛德溫·哈伯為名，在地球軌道上運行的太空望遠鏡。哈伯望遠鏡接收地面控制中心的指令並將各種觀測數據通過無線線傳輸回地球。',487688000000,'金屬','太陽射線清洗','美國','在人類歷史刻下劃痕的偉大造物','雖然舊，卻為人類的太空探索貢獻無數','images/1677678739982-1688-hubble_main.jpg','2023-03-01 13:52:19'),(6,'women','Apollo Spacecraft','阿波羅太空船，是為了實現美國《阿波羅計畫》而設計的一個一次性使用的太空飛行器。該計劃旨在於1960年代結束前成功完成載人登月並安全返回地球。',786500100000,'金屬','太陽射線清洗','美國','人類與月球的橋樑','見證了人類最早向太空探索的足跡，未來始於足下','images/1677678920354-2466-apollo_main.jpg','2023-03-01 13:55:20');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `providers`
--

DROP TABLE IF EXISTS `providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `providers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `provider` varchar(32) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `providers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `providers`
--

LOCK TABLES `providers` WRITE;
/*!40000 ALTER TABLE `providers` DISABLE KEYS */;
INSERT INTO `providers` VALUES (1,1,'native','2023-03-01 13:09:46'),(2,2,'native','2023-03-01 13:15:32'),(3,3,'native','2023-03-01 13:16:16'),(4,4,'native','2023-03-01 13:16:34');
/*!40000 ALTER TABLE `providers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(32) DEFAULT NULL,
  `access` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','1111'),(2,'merchant','0101'),(3,'marketing','0011'),(4,'user','0001');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','admin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$Bp7gvRyY37EhPhdum5UDMg$LLEbptuAijZ8+8GrF9TncOgTczeKHOywG+r0mvfwKgs',NULL,1),(2,'merchant','merchant@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$p4q089VSnIpiSQrN3utLXA$Y5TOemIiWeo+5hNSrv+ujaeYPNGyE4OxZMJyl3tbENQ',NULL,2),(3,'marketing','marketing@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$FXL+XPmy/duYA/gyRYYpCA$P1Xs1jwTg20MWJM4Vxy2e8aLncAJCMfEmtjnHm6gZJw',NULL,3),(4,'user','user@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$EKWEQcCXs2xrhljqFXqZMA$HoOFqFizfTqdV24DpHyOYzP0aesxFE5TI/FWAB866SU',NULL,4);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `color_name` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `color_code` varchar(8) DEFAULT NULL,
  `size` varchar(8) DEFAULT NULL,
  `stock` smallint DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (1,1,'群青','4c8dae','XL',28,'2023-03-01 13:42:16'),(2,1,'蒼黑','395260','XS',24,'2023-03-01 13:42:16'),(3,1,'竹青','789262','M',4,'2023-03-01 13:42:16'),(4,2,'橙黃','ffa400','S',9,'2023-03-01 13:45:47'),(5,2,'橙黃','ffa400','XS',8,'2023-03-01 13:45:47'),(6,2,'薑黃','ffc773','XS',35,'2023-03-01 13:45:47'),(7,3,'蒼白','d1d9e0','XL',19,'2023-03-01 13:48:10'),(8,3,'草綠','40de5a','XS',9,'2023-03-01 13:48:10'),(9,3,'寶藍','4b5cc4','M',10,'2023-03-01 13:48:10'),(10,4,'青葱','0aa344','L',18,'2023-03-01 13:49:55'),(11,4,'寶藍','4b5cc4','L',7,'2023-03-01 13:49:55'),(12,4,'胭脂','9d2933','L',29,'2023-03-01 13:49:55'),(13,5,'寶藍','4b5cc4','2XL',29,'2023-03-01 13:52:19'),(14,5,'寶藍','4b5cc4','XL',49,'2023-03-01 13:52:19'),(15,5,'绯红','c83c23','XL',20,'2023-03-01 13:52:20'),(16,6,'群青','4c8dae','XS',32,'2023-03-01 13:55:20'),(17,6,'赤金','f2be45','L',37,'2023-03-01 13:55:20'),(18,6,'品紅','f00056','S',23,'2023-03-01 13:55:20');
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-01 14:04:34
