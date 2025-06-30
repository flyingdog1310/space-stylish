/**
 * State Manager - 應用程式狀態管理
 * 提供簡單的狀態管理和事件系統
 */

class StateManager {
    constructor() {
        this.state = {
            user: null,
            cart: [],
            products: [],
            loading: false,
            error: null
        };
        this.listeners = new Map();
    }

    /**
     * 獲取當前狀態
     * @param {string} key - 狀態鍵值
     * @returns {*} 狀態值
     */
    getState(key = null) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }

    /**
     * 更新狀態
     * @param {string|Object} key - 狀態鍵值或狀態物件
     * @param {*} value - 狀態值
     */
    setState(key, value = null) {
        if (typeof key === 'object') {
            // 如果傳入的是物件，合併狀態
            this.state = { ...this.state, ...key };
        } else {
            // 如果傳入的是鍵值對
            this.state[key] = value;
        }

        // 觸發狀態變更事件
        this.notifyListeners(key);
    }

    /**
     * 訂閱狀態變更
     * @param {string} key - 狀態鍵值
     * @param {Function} callback - 回調函數
     * @returns {Function} 取消訂閱函數
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // 返回取消訂閱函數
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * 通知監聽器
     * @param {string} key - 狀態鍵值
     */
    notifyListeners(key) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(this.state[key], this.state);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }

    // 用戶相關狀態管理
    setUser(user) {
        this.setState('user', user);
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }

    getUser() {
        return this.state.user;
    }

    isLoggedIn() {
        return !!this.state.user;
    }

    // 購物車相關狀態管理
    addToCart(product, quantity = 1) {
        const cart = [...this.state.cart];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }

        this.setState('cart', cart);
        this.saveCartToStorage(cart);
    }

    removeFromCart(productId) {
        const cart = this.state.cart.filter(item => item.id !== productId);
        this.setState('cart', cart);
        this.saveCartToStorage(cart);
    }

    updateCartItemQuantity(productId, quantity) {
        const cart = this.state.cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        this.setState('cart', cart);
        this.saveCartToStorage(cart);
    }

    getCartTotal() {
        return this.state.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getCartItemCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.setState('cart', []);
        this.saveCartToStorage([]);
    }

    // 產品相關狀態管理
    setProducts(products) {
        this.setState('products', products);
    }

    getProducts() {
        return this.state.products;
    }

    // 載入狀態管理
    setLoading(loading) {
        this.setState('loading', loading);
    }

    isLoading() {
        return this.state.loading;
    }

    // 錯誤狀態管理
    setError(error) {
        this.setState('error', error);
    }

    getError() {
        return this.state.error;
    }

    clearError() {
        this.setState('error', null);
    }

    // 本地儲存管理
    saveCartToStorage(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    loadCartFromStorage() {
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                this.setState('cart', cart);
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
        }
    }

    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                this.setState('user', user);
            }
        } catch (error) {
            console.error('Failed to load user from storage:', error);
        }
    }

    // 初始化狀態
    initialize() {
        this.loadCartFromStorage();
        this.loadUserFromStorage();
    }

    // 重置狀態
    reset() {
        this.state = {
            user: null,
            cart: [],
            products: [],
            loading: false,
            error: null
        };
        localStorage.removeItem('cart');
        localStorage.removeItem('user');
        this.notifyListeners('*'); // 通知所有監聽器
    }
}

// 創建全域狀態管理器實例
const stateManager = new StateManager();

// 初始化狀態
stateManager.initialize();

export default stateManager;
