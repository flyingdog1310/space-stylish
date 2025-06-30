/**
 * ProductCard Component - 產品卡片組件
 * 可重用的產品展示組件
 */

class ProductCard {
    constructor(product, options = {}) {
        this.product = product;
        this.options = {
            showAddToCart: true,
            showPrice: true,
            showDescription: true,
            className: 'product-card',
            ...options
        };
    }

    /**
     * 渲染產品卡片
     * @returns {HTMLElement} 產品卡片元素
     */
    render() {
        const card = document.createElement('div');
        card.className = this.options.className;
        card.innerHTML = this.getHTML();

        // 綁定事件
        this.bindEvents(card);

        return card;
    }

    /**
     * 獲取 HTML 內容
     * @returns {string} HTML 字串
     */
    getHTML() {
        const { product, options } = this;

        return `
            <div class="product-image">
                <img src="${product.main_image}" alt="${product.title}" loading="lazy">
                ${this.getBadgeHTML()}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                ${options.showDescription && product.description ?
                    `<p class="product-description">${this.truncateText(product.description, 100)}</p>` : ''
                }
                ${options.showPrice ?
                    `<div class="product-price">
                        <span class="price">NT$ ${product.price.toLocaleString()}</span>
                        ${product.original_price && product.original_price > product.price ?
                            `<span class="original-price">NT$ ${product.original_price.toLocaleString()}</span>` : ''
                        }
                    </div>` : ''
                }
                <div class="product-meta">
                    <span class="product-category">${product.category}</span>
                    ${product.stock ?
                        `<span class="product-stock ${product.stock < 10 ? 'low-stock' : ''}">
                            庫存: ${product.stock}
                        </span>` : ''
                    }
                </div>
                ${options.showAddToCart ?
                    `<div class="product-actions">
                        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                            <i class="icon-cart"></i>
                            加入購物車
                        </button>
                        <button class="btn btn-secondary view-details-btn" data-product-id="${product.id}">
                            查看詳情
                        </button>
                    </div>` : ''
                }
            </div>
        `;
    }

    /**
     * 獲取徽章 HTML
     * @returns {string} 徽章 HTML
     */
    getBadgeHTML() {
        const { product } = this;
        let badges = [];

        // 新品徽章
        if (product.is_new) {
            badges.push('<span class="badge badge-new">新品</span>');
        }

        // 熱銷徽章
        if (product.is_hot) {
            badges.push('<span class="badge badge-hot">熱銷</span>');
        }

        // 折扣徽章
        if (product.original_price && product.original_price > product.price) {
            const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
            badges.push(`<span class="badge badge-discount">-${discount}%</span>`);
        }

        // 缺貨徽章
        if (product.stock === 0) {
            badges.push('<span class="badge badge-out-of-stock">缺貨</span>');
        }

        return badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : '';
    }

    /**
     * 綁定事件
     * @param {HTMLElement} card - 卡片元素
     */
    bindEvents(card) {
        // 加入購物車按鈕
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddToCart();
            });
        }

        // 查看詳情按鈕
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleViewDetails();
            });
        }

        // 卡片點擊事件
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.handleCardClick();
            }
        });
    }

    /**
     * 處理加入購物車
     */
    handleAddToCart() {
        if (this.product.stock === 0) {
            this.showMessage('商品已缺貨', 'error');
            return;
        }

        // 觸發自定義事件
        const event = new CustomEvent('addToCart', {
            detail: {
                product: this.product,
                quantity: 1
            }
        });
        document.dispatchEvent(event);

        this.showMessage('已加入購物車', 'success');
    }

    /**
     * 處理查看詳情
     */
    handleViewDetails() {
        window.location.href = `/product?id=${this.product.id}`;
    }

    /**
     * 處理卡片點擊
     */
    handleCardClick() {
        this.handleViewDetails();
    }

    /**
     * 顯示訊息
     * @param {string} message - 訊息內容
     * @param {string} type - 訊息類型 (success, error, warning)
     */
    showMessage(message, type = 'info') {
        // 觸發自定義事件
        const event = new CustomEvent('showMessage', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    /**
     * 截斷文字
     * @param {string} text - 原始文字
     * @param {number} maxLength - 最大長度
     * @returns {string} 截斷後的文字
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 更新產品資料
     * @param {Object} product - 新的產品資料
     */
    update(product) {
        this.product = { ...this.product, ...product };
        const card = document.querySelector(`[data-product-id="${this.product.id}"]`)?.closest('.product-card');
        if (card) {
            card.innerHTML = this.getHTML();
            this.bindEvents(card);
        }
    }

    /**
     * 設定載入狀態
     * @param {boolean} loading - 是否載入中
     */
    setLoading(loading) {
        const card = document.querySelector(`[data-product-id="${this.product.id}"]`)?.closest('.product-card');
        if (card) {
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.disabled = loading;
                addToCartBtn.innerHTML = loading ?
                    '<i class="icon-spinner"></i> 處理中...' :
                    '<i class="icon-cart"></i> 加入購物車';
            }
        }
    }
}

export default ProductCard;
