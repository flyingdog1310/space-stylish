# Space Stylish 數據庫架構文檔

## 📋 概述

Space Stylish 是一個電商網站系統，使用 MySQL 數據庫管理產品、用戶、訂單、行銷活動等數據。本文檔詳細描述了數據庫的表結構、關係和設計原則。

## 🗄️ 數據庫信息

- **數據庫名稱**: `stylish`
- **字符集**: UTF-8
- **排序規則**: utf8mb4_unicode_ci
- **引擎**: InnoDB

## 📊 表結構

### 1. 產品表 (`product`)

**用途**: 存儲產品的基本信息

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 產品唯一標識符 |
| `category` | varchar | 16 | ❌ | NULL | 產品類別 (men/women/accessories) |
| `title` | nvarchar | 32 | ✅ | - | 產品標題 |
| `description` | nvarchar | 255 | ❌ | NULL | 產品描述 |
| `price` | DECIMAL | 28,0 | ❌ | NULL | 產品價格 |
| `texture` | nvarchar | 32 | ❌ | NULL | 材質信息 |
| `wash` | nvarchar | 32 | ❌ | NULL | 洗滌說明 |
| `place` | nvarchar | 32 | ❌ | NULL | 產地 |
| `note` | nvarchar | 64 | ❌ | NULL | 備註信息 |
| `story` | nvarchar | 255 | ❌ | NULL | 產品故事 |
| `main_image` | nvarchar | 255 | ❌ | NULL | 主圖片URL |
| `created_time` | timestamp | - | ✅ | CURRENT_TIMESTAMP | 創建時間 |

**索引**:
- PRIMARY KEY (`id`)

**示例數據**:
```sql
INSERT INTO product (category, title, description, price, texture, wash, place, note, story, main_image)
VALUES ('men', '厚實毛呢格子外套', '高抗寒素材選用，保暖也時尚有型', 2200, '棉、聚脂纖維', '手洗(水溫40度)', '韓國', '實品顏色以單品照為主', '你絕對不能錯過的超值商品', '/images/men_coat.jpg');
```

### 2. 圖片表 (`images`)

**用途**: 存儲產品的額外圖片

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 圖片唯一標識符 |
| `product_id` | int | - | ❌ | NULL | 關聯的產品ID |
| `image` | nvarchar | 255 | ❌ | NULL | 圖片URL |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)

**示例數據**:
```sql
INSERT INTO images (product_id, image)
VALUES (1, '/images/men_coat_detail1.jpg');
```

### 3. 變體表 (`variants`)

**用途**: 存儲產品的顏色、尺寸、庫存等變體信息

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 變體唯一標識符 |
| `product_id` | int | - | ❌ | NULL | 關聯的產品ID |
| `color_name` | nvarchar | 16 | ❌ | NULL | 顏色名稱 |
| `color_code` | varchar | 8 | ❌ | NULL | 顏色代碼 (十六進制) |
| `size` | varchar | 8 | ❌ | NULL | 尺寸 (XS/S/M/L/XL/2XL) |
| `stock` | smallint | - | ❌ | NULL | 庫存數量 |
| `created_time` | timestamp | - | ✅ | CURRENT_TIMESTAMP | 創建時間 |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)

**示例數據**:
```sql
INSERT INTO variants (product_id, color_name, color_code, size, stock)
VALUES (1, '白色', 'FFFFFF', 'M', 10);
```

### 4. 行銷活動表 (`campaigns`)

**用途**: 存儲行銷活動信息

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 活動唯一標識符 |
| `product_id` | int | - | ❌ | NULL | 關聯的產品ID |
| `picture` | nvarchar | 255 | ❌ | NULL | 活動圖片URL |
| `story` | nvarchar | 255 | ❌ | NULL | 活動故事描述 |
| `created_time` | timestamp | - | ✅ | CURRENT_TIMESTAMP | 創建時間 |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)

**示例數據**:
```sql
INSERT INTO campaigns (product_id, picture, story)
VALUES (1, '/campaigns/spring_sale.jpg', '春季特賣\n限時優惠\n搶購從速\n飛狗');
```

### 5. 用戶表 (`user`)

**用途**: 存儲用戶賬戶信息

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 用戶唯一標識符 |
| `name` | nvarchar | 64 | ❌ | NULL | 用戶姓名 |
| `email` | varchar | 255 | ❌ | NULL | 電子郵箱 (唯一) |
| `password` | varchar | 255 | ❌ | NULL | 密碼 (加密) |
| `picture` | nvarchar | 255 | ❌ | NULL | 用戶頭像URL |
| `role_id` | int | - | ❌ | NULL | 角色ID |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`email`)
- FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)

**示例數據**:
```sql
INSERT INTO user (name, email, password, picture, role_id)
VALUES ('張三', 'zhangsan@example.com', '$2b$12$...', '/avatars/user1.jpg', 1);
```

### 6. 角色表 (`roles`)

**用途**: 定義用戶角色和權限

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 角色唯一標識符 |
| `role` | varchar | 32 | ❌ | NULL | 角色名稱 |
| `access` | varchar | 255 | ❌ | NULL | 權限字符串 |

**索引**:
- PRIMARY KEY (`id`)

**示例數據**:
```sql
INSERT INTO roles (role, access) VALUES
('admin', '1111'),
('merchant', '0101'),
('marketing', '0011'),
('user', '0001');
```

### 7. 第三方登錄表 (`providers`)

**用途**: 存儲第三方登錄信息 (如 Facebook)

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 記錄唯一標識符 |
| `user_id` | int | - | ❌ | NULL | 關聯的用戶ID |
| `provider` | varchar | 32 | ❌ | NULL | 第三方提供商 |
| `created_time` | timestamp | - | ✅ | CURRENT_TIMESTAMP | 創建時間 |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)

**示例數據**:
```sql
INSERT INTO providers (user_id, provider)
VALUES (1, 'facebook');
```

### 8. 訂單表 (`orders`)

**用途**: 存儲訂單基本信息

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 訂單唯一標識符 |
| `user_id` | int | - | ❌ | NULL | 關聯的用戶ID |
| `shipping` | varchar | 32 | ❌ | NULL | 配送方式 |
| `payment` | varchar | 32 | ❌ | NULL | 支付方式 |
| `subtotal` | DECIMAL | 28,0 | ❌ | NULL | 小計金額 |
| `freight` | DECIMAL | 26,0 | ❌ | NULL | 運費 |
| `total` | DECIMAL | 28,0 | ❌ | NULL | 總金額 |
| `name` | nvarchar | 64 | ❌ | NULL | 收貨人姓名 |
| `phone` | varchar | 16 | ❌ | NULL | 收貨人電話 |
| `email` | varchar | 255 | ❌ | NULL | 收貨人郵箱 |
| `address` | nvarchar | 255 | ❌ | NULL | 收貨地址 |
| `time` | varchar | 16 | ❌ | NULL | 配送時間 |
| `rec_trade_id` | varchar | 255 | ❌ | NULL | 交易ID |
| `status` | varchar | 16 | ❌ | NULL | 訂單狀態 |
| `created_time` | timestamp | - | ✅ | CURRENT_TIMESTAMP | 創建時間 |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)

**示例數據**:
```sql
INSERT INTO orders (user_id, shipping, payment, subtotal, freight, total, name, phone, email, address, status)
VALUES (1, 'standard', 'credit_card', 2200, 60, 2260, '李四', '0912345678', 'lisi@example.com', '台北市信義區...', 'pending');
```

### 9. 訂單明細表 (`order_lists`)

**用途**: 存儲訂單中的商品明細

| 欄位名稱 | 數據類型 | 長度 | 是否必填 | 默認值 | 說明 |
|---------|---------|------|---------|--------|------|
| `id` | int | - | ✅ | AUTO_INCREMENT | 明細唯一標識符 |
| `order_id` | int | - | ❌ | NULL | 關聯的訂單ID |
| `product_id` | int | - | ❌ | NULL | 關聯的產品ID |
| `name` | nvarchar | 32 | ❌ | NULL | 產品名稱 |
| `price` | DECIMAL | 28,0 | ❌ | NULL | 產品價格 |
| `color_name` | nvarchar | 16 | ❌ | NULL | 顏色名稱 |
| `color_code` | varchar | 8 | ❌ | NULL | 顏色代碼 |
| `size` | varchar | 8 | ❌ | NULL | 尺寸 |
| `qty` | smallint | - | ❌ | NULL | 購買數量 |

**索引**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
- FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)

**示例數據**:
```sql
INSERT INTO order_lists (order_id, product_id, name, price, color_name, color_code, size, qty)
VALUES (1, 1, '厚實毛呢格子外套', 2200, '白色', 'FFFFFF', 'M', 1);
```

## 🔗 表關係圖

```
product (1) ←→ (N) images
product (1) ←→ (N) variants
product (1) ←→ (N) campaigns
user (1) ←→ (N) providers
user (1) ←→ (N) orders
user (N) ←→ (1) roles
orders (1) ←→ (N) order_lists
order_lists (N) ←→ (1) product
```

## 📝 常用查詢示例

### 1. 獲取產品及其圖片和變體
```sql
SELECT p.*,
       GROUP_CONCAT(DISTINCT i.image) as images,
       GROUP_CONCAT(DISTINCT v.color_code) as color_codes,
       GROUP_CONCAT(DISTINCT v.size) as sizes
FROM product p
LEFT JOIN images i ON p.id = i.product_id
LEFT JOIN variants v ON p.id = v.product_id
WHERE p.category = 'men'
GROUP BY p.id
ORDER BY p.created_time DESC;
```

### 2. 獲取行銷活動及關聯產品
```sql
SELECT c.*, p.title as product_name, p.price as product_price
FROM campaigns c
LEFT JOIN product p ON c.product_id = p.id
ORDER BY c.created_time DESC;
```

### 3. 獲取用戶訂單及明細
```sql
SELECT o.*, ol.*, p.title as product_title
FROM orders o
LEFT JOIN order_lists ol ON o.id = ol.order_id
LEFT JOIN product p ON ol.product_id = p.id
WHERE o.user_id = ?
ORDER BY o.created_time DESC;
```

### 4. 庫存查詢
```sql
SELECT p.title, v.color_name, v.size, v.stock
FROM product p
INNER JOIN variants v ON p.id = v.product_id
WHERE v.stock <= 10
ORDER BY v.stock ASC;
```

## 🎯 設計原則

### 1. 正規化
- 遵循第三正規化形式 (3NF)
- 避免數據冗餘
- 使用外鍵約束保證數據完整性

### 2. 性能優化
- 主鍵使用自增整數
- 適當的索引設計
- 合理的字段長度設置

### 3. 擴展性
- 模塊化的表設計
- 支持多種產品變體
- 靈活的權限系統

### 4. 數據完整性
- 外鍵約束
- 唯一性約束
- 非空約束

## 🔧 維護建議

### 1. 定期備份
```bash
mysqldump -u username -p stylish > backup_$(date +%Y%m%d).sql
```

### 2. 性能監控
```sql
-- 查看慢查詢
SHOW VARIABLES LIKE 'slow_query_log';

-- 查看表大小
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'stylish';
```

### 3. 索引優化
```sql
-- 分析查詢性能
EXPLAIN SELECT * FROM product WHERE category = 'men';

-- 創建複合索引
CREATE INDEX idx_product_category_created ON product(category, created_time);
```

## 📚 相關文檔

- [API 文檔](./API_DOCUMENTATION.md)
- [設置指南](./SETUP.md)
- [MVC 重構計劃](./MVC_REFACTOR_PLAN.md)
- [數據庫日誌說明](./DATABASE_LOGGING.md)

---

**最後更新**: 2024-01-XX
**版本**: 1.0.0
**維護者**: Space Stylish 開發團隊
