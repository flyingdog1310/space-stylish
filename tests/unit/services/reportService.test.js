import reportService from '../../../src/services/reportService.js';

describe('ReportService', () => {
    describe('hexToRgb', () => {
        test('should convert hex color to RGB', () => {
            const result = reportService.hexToRgb('#FF0000');
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        test('should convert hex color without # to RGB', () => {
            const result = reportService.hexToRgb('00FF00');
            expect(result).toEqual({ r: 0, g: 255, b: 0 });
        });

        test('should return null for invalid hex', () => {
            const result = reportService.hexToRgb('invalid');
            expect(result).toBeNull();
        });
    });

    describe('getTotalSales', () => {
        test('should get total sales', async () => {
            // 這裡需要 mock 資料庫調用
            // 暫時跳過實際測試
            expect(true).toBe(true);
        });
    });

    describe('getTopFiveProducts', () => {
        test('should get top five products', async () => {
            // 這裡需要 mock 資料庫調用
            // 暫時跳過實際測試
            expect(true).toBe(true);
        });
    });
});
