import { pool, executeQuery } from "../../config/database.js";

export class ProductModel {
    /**
     * 創建產品
     * @param {Object} productData - 產品資料
     * @returns {Promise<Object>} 創建的產品
     */
    async create(productData) {
        try {
            const {
                category,
                title,
                description,
                price,
                texture,
                wash,
                place,
                note,
                story,
                variants,
                main_image,
                images,
            } = productData;

            // 創建主產品
            const [productResult] = await pool.query(
                `INSERT INTO product (
                    category, title, description, price, texture, wash, place, note, story, main_image
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [category, title, description, price, texture, wash, place, note, story, main_image],
            );

            const productId = productResult.insertId;

            // 創建產品圖片
            if (images && images.length > 0) {
                for (const image of images) {
                    await pool.query("INSERT INTO images (product_id, image) VALUES (?, ?)", [productId, image]);
                }
            }

            // 創建產品變體
            if (variants && variants.length > 0) {
                for (const variant of variants) {
                    await pool.query(
                        `INSERT INTO variants (
                            product_id, color_code, color_name, size, stock
                        ) VALUES (?, ?, ?, ?, ?)`,
                        [productId, variant.color_code, variant.color_name, variant.size, variant.stock],
                    );
                }
            }

            return { id: productId, ...productData };
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    /**
     * 根據類別獲取產品
     * @param {string} category - 產品類別
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Array>} 產品列表
     */
    async findByCategory(category = "all", page = 0, limit = 6) {
        try {
            const offset = page * limit;
            let sql = `
                SELECT p.*,
                       GROUP_CONCAT(DISTINCT i.image) as images,
                       GROUP_CONCAT(DISTINCT v.color_code) as color_codes,
                       GROUP_CONCAT(DISTINCT v.size) as sizes
                FROM product p
                LEFT JOIN images i ON p.id = i.product_id
                LEFT JOIN variants v ON p.id = v.product_id
            `;

            const params = [];

            if (category !== "all") {
                sql += " WHERE p.category = ?";
                params.push(category);
            }

            sql += " GROUP BY p.id ORDER BY p.created_time DESC LIMIT ? OFFSET ?";
            params.push(limit, offset);

            const [products] = await pool.query(sql, params);

            // 處理圖片和變體資料
            return products.map((product) => ({
                ...product,
                images: product.images ? product.images.split(",") : [],
                color_codes: product.color_codes ? product.color_codes.split(",") : [],
                sizes: product.sizes ? product.sizes.split(",") : [],
            }));
        } catch (error) {
            throw new Error(`Failed to get products by category: ${error.message}`);
        }
    }

    /**
     * 根據關鍵字搜尋產品
     * @param {string} keyword - 搜尋關鍵字
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Array>} 搜尋結果
     */
    async searchByKeyword(keyword, page = 0, limit = 6) {
        try {
            const offset = page * limit;
            const sql = `
                SELECT p.*,
                       GROUP_CONCAT(DISTINCT i.image) as images,
                       GROUP_CONCAT(DISTINCT v.color_code) as color_codes,
                       GROUP_CONCAT(DISTINCT v.size) as sizes
                FROM product p
                LEFT JOIN images i ON p.id = i.product_id
                LEFT JOIN variants v ON p.id = v.product_id
                WHERE p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?
                GROUP BY p.id ORDER BY p.created_time DESC LIMIT ? OFFSET ?
            `;

            const searchTerm = `%${keyword}%`;
            const [products] = await pool.query(sql, [searchTerm, searchTerm, searchTerm, limit, offset]);

            return products.map((product) => ({
                ...product,
                images: product.images ? product.images.split(",") : [],
                color_codes: product.color_codes ? product.color_codes.split(",") : [],
                sizes: product.sizes ? product.sizes.split(",") : [],
            }));
        } catch (error) {
            throw new Error(`Failed to search products: ${error.message}`);
        }
    }

    /**
     * 根據ID獲取產品
     * @param {number} productId - 產品ID
     * @returns {Promise<Object|null>} 產品詳情
     */
    async findById(productId) {
        try {
            // 獲取主產品資訊
            const products = await executeQuery("SELECT * FROM product WHERE id = ?", [productId]);

            if (products.length === 0) {
                return null;
            }

            const product = products[0];

            // 獲取產品圖片
            const images = await executeQuery("SELECT image FROM images WHERE product_id = ?", [productId]);

            // 獲取產品變體
            const variants = await executeQuery("SELECT * FROM variants WHERE product_id = ?", [productId]);

            return {
                ...product,
                images: images.map((img) => img.image),
                variants: variants,
            };
        } catch (error) {
            // 這裡的錯誤已經被 executeQuery 詳細記錄了
            throw new Error(`Failed to get product by ID: ${error.message}`);
        }
    }

    /**
     * 更新產品
     * @param {number} productId - 產品ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<Object>} 更新後的產品
     */
    async update(productId, updateData) {
        try {
            const allowedFields = [
                "category",
                "title",
                "description",
                "price",
                "texture",
                "wash",
                "place",
                "note",
                "story",
                "main_image",
            ];
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key)) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) {
                throw new Error("No valid fields to update");
            }

            values.push(productId);

            const sql = `UPDATE product SET ${updates.join(", ")} WHERE id = ?`;
            const [result] = await pool.query(sql, values);

            if (result.affectedRows === 0) {
                throw new Error("Product not found");
            }

            return await this.findById(productId);
        } catch (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    /**
     * 刪除產品
     * @param {number} productId - 產品ID
     * @returns {Promise<boolean>} 刪除結果
     */
    async delete(productId) {
        try {
            // 刪除相關資料
            await pool.query("DELETE FROM images WHERE product_id = ?", [productId]);
            await pool.query("DELETE FROM variants WHERE product_id = ?", [productId]);

            const [result] = await pool.query("DELETE FROM product WHERE id = ?", [productId]);

            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    /**
     * 獲取類別產品數量
     * @param {string} category - 產品類別
     * @returns {Promise<number>} 產品數量
     */
    async getCountByCategory(category = "all") {
        try {
            let sql = "SELECT COUNT(*) as count FROM product";
            const params = [];

            if (category !== "all") {
                sql += " WHERE category = ?";
                params.push(category);
            }

            const [result] = await pool.query(sql, params);
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get product count: ${error.message}`);
        }
    }

    /**
     * 獲取搜尋結果數量
     * @param {string} keyword - 搜尋關鍵字
     * @returns {Promise<number>} 搜尋結果數量
     */
    async getSearchCount(keyword) {
        try {
            const sql = `
                SELECT COUNT(DISTINCT p.id) as count
                FROM product p
                WHERE p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?
            `;

            const searchTerm = `%${keyword}%`;
            const [result] = await pool.query(sql, [searchTerm, searchTerm, searchTerm]);
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get search count: ${error.message}`);
        }
    }

    /**
     * 獲取低庫存產品
     * @returns {Promise<Array>} 低庫存產品列表
     */
    async getLowStockProducts() {
        try {
            const [products] = await pool.query(
                `SELECT p.id, p.title, p.main_image, v.color_code, v.size, v.stock
                 FROM product p
                 INNER JOIN variants v ON p.id = v.product_id
                 WHERE v.stock <= 10
                 ORDER BY v.stock ASC`,
            );
            return products;
        } catch (error) {
            throw new Error(`Failed to get low stock products: ${error.message}`);
        }
    }

    /**
     * 獲取缺貨產品
     * @returns {Promise<Array>} 缺貨產品列表
     */
    async getOutOfStockProducts() {
        try {
            const [products] = await pool.query(
                `SELECT p.id, p.title, p.main_image, v.color_code, v.size
                 FROM product p
                 INNER JOIN variants v ON p.id = v.product_id
                 WHERE v.stock = 0
                 ORDER BY p.title ASC`,
            );
            return products;
        } catch (error) {
            throw new Error(`Failed to get out of stock products: ${error.message}`);
        }
    }

    /**
     * 獲取產品總數
     * @returns {Promise<number>} 產品總數
     */
    async getTotalProductCount() {
        try {
            const [result] = await pool.query("SELECT COUNT(*) as count FROM product");
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get total product count: ${error.message}`);
        }
    }

    /**
     * 獲取類別統計
     * @returns {Promise<Array>} 類別統計
     */
    async getCategoryBreakdown() {
        try {
            const [categories] = await pool.query(
                "SELECT category, COUNT(*) as count FROM product GROUP BY category ORDER BY count DESC",
            );
            return categories;
        } catch (error) {
            throw new Error(`Failed to get category breakdown: ${error.message}`);
        }
    }
}
