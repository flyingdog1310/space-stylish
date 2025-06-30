/**
 * 產品 API 客戶端
 * 統一管理所有產品相關的 API 呼叫
 */
class ProductAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiVersion = 'v1';
        this.endpoint = `/api/${this.apiVersion}/products`;
    }

    /**
     * 發送 API 請求
     * @param {string} url - 請求 URL
     * @param {Object} options - 請求選項
     * @returns {Promise} API 回應
     */
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * 獲取產品列表
     * @param {string} category - 產品類別
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise} 產品列表
     */
    async getProducts(category = 'all', page = 0, limit = 6) {
        const params = new URLSearchParams({
            category,
            page: page.toString(),
            limit: limit.toString()
        });

        return await this.request(`${this.endpoint}?${params}`);
    }

    /**
     * 搜尋產品
     * @param {string} keyword - 搜尋關鍵字
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise} 搜尋結果
     */
    async searchProducts(keyword, page = 0, limit = 6) {
        const params = new URLSearchParams({
            keyword,
            page: page.toString(),
            limit: limit.toString()
        });

        return await this.request(`${this.endpoint}/search?${params}`);
    }

    /**
     * 獲取產品詳情
     * @param {number} productId - 產品ID
     * @returns {Promise} 產品詳情
     */
    async getProductDetail(productId) {
        return await this.request(`${this.endpoint}/${productId}`);
    }

    /**
     * 創建產品
     * @param {FormData} formData - 產品資料
     * @returns {Promise} 創建結果
     */
    async createProduct(formData) {
        return await this.request(`${this.endpoint}`, {
            method: 'POST',
            headers: {
                // 不設定 Content-Type，讓瀏覽器自動設定 multipart/form-data
            },
            body: formData
        });
    }

    /**
     * 更新產品
     * @param {number} productId - 產品ID
     * @param {Object} productData - 更新資料
     * @returns {Promise} 更新結果
     */
    async updateProduct(productId, productData) {
        return await this.request(`${this.endpoint}/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    /**
     * 刪除產品
     * @param {number} productId - 產品ID
     * @returns {Promise} 刪除結果
     */
    async deleteProduct(productId) {
        return await this.request(`${this.endpoint}/${productId}`, {
            method: 'DELETE'
        });
    }
}

// 創建全域實例
window.ProductAPI = new ProductAPI();
