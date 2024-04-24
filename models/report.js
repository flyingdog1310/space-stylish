import { pool } from "../util/mysql.js";

export async function getOrder() {
    const [row] = await pool.query("SELECT user_id, total FROM orders");
    console.log(row);
    return row;
}

export async function getTotal() {
    const [total] = await pool.query("SELECT SUM (total) FROM orders");
    return total;
}

export async function getSoldColor() {
    const [color] = await pool.query("SELECT DISTINCT color_code, color_name FROM order_lists;");
    for (let i = 0; i < color.length; i++) {
        const [total] = await pool.query("SELECT SUM (qty) FROM order_lists Where color_code=?", [color[i].color_code]);
        color[i].total = total[0]["SUM (qty)"];
    }
    console.log(color);
    return color;
}

export async function getSoldPrice() {
    let totalPrice = [];
    let price;
    for (let i = 500; i < 2000; i += 20) {
        [price] = await pool.query("SELECT SUM (qty) FROM order_lists WHERE price BETWEEN ? AND ?", [i, i + 19]);
        totalPrice.push({ price: i, amount: price[0]["SUM (qty)"] });
    }
    return totalPrice;
}

export async function getTopFive() {
    let allCandidate = [];
    let candidates;
    [candidates] = await pool.query("SELECT DISTINCT product_id FROM order_lists;", []);
    for (let i = 0; i < candidates.length; i++) {
        const [total] = await pool.query("SELECT SUM (qty) FROM order_lists Where product_id=?", [
            candidates[i].product_id,
        ]);
        allCandidate[i] = {};
        allCandidate[i].product_id = candidates[i].product_id;
        allCandidate[i].total = total[0]["SUM (qty)"];
    }
    let filter = allCandidate.map((candidate) => {
        return Number(candidate.total);
    });
    let topFiveNum = [];
    for (let i = 0; i < 5; i++) {
        let max = Math.max(...filter);
        topFiveNum.push(max);
        let max_place = filter.indexOf(max);
        filter.splice(max_place, 1);
    }
    let topFive = [];

    for (let i = 0; i < topFiveNum.length; i++) {
        for (let j = 0; j < allCandidate.length; j++) {
            if (topFiveNum[i] == allCandidate[j].total) {
                topFive.push(allCandidate[j].product_id);
            }
        }
    }

    let topFiveResult = [];
    for (let i = 0; i < topFive.length; i++) {
        topFiveResult[i] = { product_id: topFive[i], variants: [] };
        for (let j = 0; j < 3; j++) {
            let size = "S";
            if (j == 1) {
                size = "M";
            }
            if (j == 2) {
                size = "L";
            }
            const [topFiveTotal] = await pool.query("SELECT SUM (qty) FROM order_lists Where product_id=? AND size=?", [
                topFive[i],
                size,
            ]);
            topFiveResult[i].variants[j] = { size: size, total: topFiveTotal[0]["SUM (qty)"] };
        }
    }
    return topFiveResult;
}
