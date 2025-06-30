/**
 * API Client - 統一的 API 呼叫客戶端
 * 處理所有與後端 API 的通信
 */

class ApiClient {
    constructor() {
        this.baseURL = '/api/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * 設定認證 Token
     * @param {string} token - JWT Token
     */
    setAuthToken(token) {
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * 通用請求方法
     * @param {string} endpoint - API 端點
     * @param {Object} options - 請求選項
     * @returns {Promise} 回應 Promise
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET 請求
     * @param {string} endpoint - API 端點
     * @param {Object} params - 查詢參數
     * @returns {Promise} 回應 Promise
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, { method: 'GET' });
    }

    /**
     * POST 請求
     * @param {string} endpoint - API 端點
     * @param {Object} data - 請求資料
     * @returns {Promise} 回應 Promise
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 請求
     * @param {string} endpoint - API 端點
     * @param {Object} data - 請求資料
     * @returns {Promise} 回應 Promise
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 請求
     * @param {string} endpoint - API 端點
     * @returns {Promise} 回應 Promise
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // 產品相關 API
    async getProducts(category = 'all', paging = 0) {
        return this.get(`/products/${category}`, { paging });
    }

    async searchProducts(keyword, paging = 0) {
        return this.get('/products/search', { keyword, paging });
    }

    async getProductDetails(id) {
        return this.get(`/products/details`, { id });
    }

    // 用戶相關 API
    async register(userData) {
        return this.post('/user/signup', userData);
    }

    async login(credentials) {
        return this.post('/user/signin', credentials);
    }

    async getUserProfile() {
        return this.get('/user/profile');
    }

    // 購物車相關 API
    async addToCart(productId, quantity = 1) {
        return this.post('/cart/add', { product_id: productId, quantity });
    }

    async getCart() {
        return this.get('/cart');
    }

    async updateCartItem(itemId, quantity) {
        return this.put(`/cart/${itemId}`, { quantity });
    }

    async removeFromCart(itemId) {
        return this.delete(`/cart/${itemId}`);
    }

    // 訂單相關 API
    async checkout(orderData) {
        return this.post('/order/checkout', orderData);
    }

    async getOrderHistory() {
        return this.get('/order/history');
    }

    // 行銷相關 API
    async getCampaigns() {
        return this.get('/marketing/campaigns');
    }

    // 管理員相關 API
    async createProduct(productData) {
        return this.post('/admin/create_product', productData);
    }

    async createCampaign(campaignData) {
        return this.post('/admin/create_campaign', campaignData);
    }

    async getOrders() {
        return this.get('/admin/get_orders');
    }
}

// 創建全域 API 客戶端實例
const apiClient = new ApiClient();

// 從 localStorage 恢復認證 token
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
    apiClient.setAuthToken(savedToken);
}

export default apiClient;
