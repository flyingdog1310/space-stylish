/**
 * 產品列表組件
 * 負責渲染和管理產品列表
 */
class ProductList {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            itemsPerPage: 6,
            showPagination: true,
            showColors: true,
            showPrices: true,
            ...options
        };

        this.currentPage = 0;
        this.currentCategory = 'all';
        this.currentKeyword = '';
        this.products = [];
        this.pagination = null;

        this.init();
    }

    /**
     * 初始化組件
     */
    init() {
        if (!this.container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return;
        }

        this.bindEvents();
        this.loadProducts();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽 URL 參數變化
        window.addEventListener('popstate', () => {
            this.updateFromURL();
        });

        // 初始載入時檢查 URL 參數
        this.updateFromURL();
    }

    /**
     * 從 URL 更新狀態
     */
    updateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category') || 'all';
        const keyword = params.get('keyword') || '';
        const page = parseInt(params.get('page')) || 0;

        if (category !== this.currentCategory || keyword !== this.currentKeyword || page !== this.currentPage) {
            this.currentCategory = category;
            this.currentKeyword = keyword;
            this.currentPage = page;
            this.loadProducts();
        }
    }

    /**
     * 載入產品
     */
    async loadProducts() {
        try {
            this.showLoading();

            let response;
            if (this.currentKeyword) {
                response = await window.ProductAPI.searchProducts(
                    this.currentKeyword,
                    this.currentPage,
                    this.options.itemsPerPage
                );
            } else {
                response = await window.ProductAPI.getProducts(
                    this.currentCategory,
                    this.currentPage,
                    this.options.itemsPerPage
                );
            }

            this.products = response.data || [];
            this.pagination = response.pagination;

            this.render();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * 渲染產品列表
     */
    render() {
        if (this.products.length === 0) {
            this.showEmptyState();
            return;
        }

        this.container.innerHTML = this.generateHTML();
        this.bindProductEvents();

        if (this.options.showPagination && this.pagination) {
            this.renderPagination();
        }
    }

    /**
     * 生成 HTML
     */
    generateHTML() {
        const rows = this.chunkArray(this.products, 3);

        return rows.map((row, rowIndex) => `
            <div class="product-row" id="row-${rowIndex}">
                ${row.map((product, productIndex) => {
                    const globalIndex = rowIndex * 3 + productIndex;
                    return this.generateProductHTML(product, globalIndex);
                }).join('')}
            </div>
        `).join('');
    }

    /**
     * 生成產品 HTML
     */
    generateProductHTML(product, index) {
        const colorsHTML = this.options.showColors && product.colors ?
            product.colors.map(color => `
                <div class="product-color-block"
                     style="background-color: #${color.code}"
                     title="${color.name}">
                </div>
            `).join('') : '';

        const priceHTML = this.options.showPrices ?
            `<div class="product-price">TWD.${product.price}</div>` : '';

        return `
            <div class="products"></div>
            <a id="product${index}" href="/product?id=${product.id}" class="product-link">
                <div class="product-img"
                     id="product${index}-img"
                     style="background-image: url(${product.main_image})">
                </div>
                <div class="product-color" id="product${index}-color">
                    ${colorsHTML}
                </div>
                <div class="product-name" id="product${index}-name">
                    ${product.title}
                </div>
                ${priceHTML}
            </a>
        `;
    }

    /**
     * 綁定產品事件
     */
    bindProductEvents() {
        this.products.forEach((product, index) => {
            const productElement = document.getElementById(`product${index}`);
            if (productElement) {
                productElement.addEventListener('click', (e) => {
                    this.handleProductClick(product, e);
                });
            }
        });
    }

    /**
     * 處理產品點擊
     */
    handleProductClick(product, event) {
        // 可以在這裡添加點擊追蹤或其他邏輯
        console.log('Product clicked:', product);
    }

    /**
     * 渲染分頁
     */
    renderPagination() {
        if (!this.pagination || this.pagination.totalPages <= 1) {
            return;
        }

        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) {
            return;
        }

        const { currentPage, totalPages } = this.pagination;

        let paginationHTML = '<div class="pagination">';

        // 上一頁
        if (currentPage > 0) {
            paginationHTML += `<a href="#" class="page-link" data-page="${currentPage - 1}">上一頁</a>`;
        }

        // 頁碼
        for (let i = 0; i < totalPages; i++) {
            const isActive = i === currentPage;
            paginationHTML += `
                <a href="#" class="page-link ${isActive ? 'active' : ''}" data-page="${i}">
                    ${i + 1}
                </a>
            `;
        }

        // 下一頁
        if (currentPage < totalPages - 1) {
            paginationHTML += `<a href="#" class="page-link" data-page="${currentPage + 1}">下一頁</a>`;
        }

        paginationHTML += '</div>';

        paginationContainer.innerHTML = paginationHTML;
        this.bindPaginationEvents();
    }

    /**
     * 綁定分頁事件
     */
    bindPaginationEvents() {
        const pageLinks = document.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            });
        });
    }

    /**
     * 跳轉到指定頁面
     */
    goToPage(page) {
        this.currentPage = page;
        this.updateURL();
        this.loadProducts();
    }

    /**
     * 更新 URL
     */
    updateURL() {
        const params = new URLSearchParams();

        if (this.currentCategory !== 'all') {
            params.set('category', this.currentCategory);
        }

        if (this.currentKeyword) {
            params.set('keyword', this.currentKeyword);
        }

        if (this.currentPage > 0) {
            params.set('page', this.currentPage.toString());
        }

        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.pushState({}, '', newURL);
    }

    /**
     * 顯示載入狀態
     */
    showLoading() {
        this.container.innerHTML = '<div class="loading">載入中...</div>';
    }

    /**
     * 顯示錯誤狀態
     */
    showError(message) {
        this.container.innerHTML = `<div class="error">載入失敗: ${message}</div>`;
    }

    /**
     * 顯示空狀態
     */
    showEmptyState() {
        this.container.innerHTML = '<div class="empty-state">目前沒有產品可以顯示</div>';
    }

    /**
     * 將陣列分塊
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * 重新整理
     */
    refresh() {
        this.loadProducts();
    }

    /**
     * 設定類別
     */
    setCategory(category) {
        this.currentCategory = category;
        this.currentPage = 0;
        this.currentKeyword = '';
        this.updateURL();
        this.loadProducts();
    }

    /**
     * 搜尋
     */
    search(keyword) {
        this.currentKeyword = keyword;
        this.currentPage = 0;
        this.updateURL();
        this.loadProducts();
    }
}

// 全域可用
window.ProductList = ProductList;
