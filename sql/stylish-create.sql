CREATE DATABASE stylish;
USE stylish;

CREATE TABLE `product` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `category` varchar(16),
  `title` nvarchar(32) NOT NULL,
  `description` nvarchar(255),
  `price` DECIMAL(28,0),
  `texture` nvarchar(32),
  `wash` nvarchar(32),
  `place` nvarchar(32),
  `note` nvarchar(64),
  `story` nvarchar(255),
  `main_image` nvarchar(255),
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `image` nvarchar(255)
);

CREATE TABLE `variants` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `color_name` nvarchar(16),
  `color_code` varchar(8),
  `size` varchar(8),
  `stock` smallint,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `campaigns` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `product_id` int,
  `picture` nvarchar(255),
  `story` nvarchar(255),
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` nvarchar(64),
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `picture` nvarchar(255),
  `role_id` int
);

CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `role` varchar(32),
  `access` varchar(255)
);

CREATE TABLE `providers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `provider` varchar(32),
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `orders` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `shipping` varchar(32),
  `payment` varchar(32),
  `subtotal` DECIMAL(28,0),
  `freight` DECIMAL(26,0),
  `total` DECIMAL(28,0),
  `name` nvarchar(64),
  `phone` varchar(16),
  `email` varchar(255),
  `address` nvarchar(255),
  `time` varchar(16),
  `rec_trade_id` varchar(255),
  `status` varchar(16),
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `order_lists` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `order_id` int,
  `product_id` int,
  `name` nvarchar(32),
  `price` DECIMAL(28,0),
  `color_name` nvarchar(16),
  `color_code` varchar(8),
  `size` varchar(8),
  `qty` smallint
);

ALTER TABLE `images` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `variants` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `campaigns` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

ALTER TABLE `user` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `providers` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `order_lists` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

ALTER TABLE `order_lists` ADD FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);
