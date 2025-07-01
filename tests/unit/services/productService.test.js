import productService from '../../../src/services/productService.js';

describe('ProductService', () => {
    describe('validateProductData', () => {
        test('should validate correct product data', () => {
            const validProduct = {
                title: 'Test Product',
                price: 100,
                category: 'men'
            };

            const errors = productService.validateProductData(validProduct);
            expect(errors).toHaveLength(0);
        });

        test('should return errors for invalid product data', () => {
            const invalidProduct = {
                title: '',
                price: -10,
                category: ''
            };

            const errors = productService.validateProductData(invalidProduct);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors).toContain('Product title is required');
            expect(errors).toContain('Valid product price is required');
            expect(errors).toContain('Product category is required');
        });
    });

    describe('formatPrice', () => {
        test('should format price correctly', () => {
            expect(productService.formatPrice(100)).toBe('TWD.100');
            expect(productService.formatPrice(1500)).toBe('TWD.1500');
        });
    });

    describe('checkStock', () => {
        test('should check stock availability', async () => {
            const result = await productService.checkStock(1, 'M', 'red');
            expect(result).toBe(true);
        });
    });
});
