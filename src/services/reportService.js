import { getOrder, getTotal, getSoldColor, getSoldPrice, getTopFive } from "../models/report.js";

class ReportService {
    // 獲取支付報表
    async getPaymentsReport() {
        try {
            const raw = await getOrder();

            let obj = {};
            raw.forEach((item) => {
                if (!Object.keys(obj).includes(item.user_id.toString())) {
                    obj[item.user_id] = parseInt(item.total);
                } else {
                    obj[item.user_id] += parseInt(item.total);
                }
            });

            let data = [];
            for (const key in obj) {
                data.push({ user_id: key, total_payment: obj[key] });
            }

            return data;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get payments report');
        }
    }

    // 獲取總銷售額
    async getTotalSales() {
        try {
            const total = await getTotal();
            return total[0]["SUM (total)"];
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get total sales');
        }
    }

    // 顏色代碼轉換為 RGB
    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    }

    // 獲取銷售顏色百分比
    async getSoldColorPercent() {
        try {
            const soldColor = await getSoldColor();
            for (let i = 0; i < soldColor.length; i++) {
                const rgb = this.hexToRgb(soldColor[i].color_code);
                if (rgb) {
                    soldColor[i].color_code = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
                }
            }
            return soldColor;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get sold color percent');
        }
    }

    // 獲取銷售價格百分比
    async getSoldPricePercent() {
        try {
            const soldPrice = await getSoldPrice();
            return soldPrice;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get sold price percent');
        }
    }

    // 獲取前五名產品
    async getTopFiveProducts() {
        try {
            const topFive = await getTopFive();
            return topFive;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get top five products');
        }
    }

    // 生成綜合報表
    async generateComprehensiveReport() {
        try {
            const [payments, total, soldColor, soldPrice, topFive] = await Promise.all([
                this.getPaymentsReport(),
                this.getTotalSales(),
                this.getSoldColorPercent(),
                this.getSoldPricePercent(),
                this.getTopFiveProducts()
            ]);

            return {
                payments,
                total,
                soldColor,
                soldPrice,
                topFive
            };
        } catch (err) {
            console.log(err);
            throw new Error('Failed to generate comprehensive report');
        }
    }
}

export default new ReportService();
