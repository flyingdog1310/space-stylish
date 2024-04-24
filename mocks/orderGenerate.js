import { pool } from "../Stylish/server/util/mysql.js";

const genRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

let rows = 3;
if (process.argv.length === 2) {
    console.log("default times: ", rows);
} else if (process.argv.length === 3) {
    rows = parseInt(process.argv[2]);
}

let userId = 0;
let total = 0;

export async function createOrder(userId, total) {
    const [orderResult] = await pool.query(
        `
        INSERT INTO orders (user_id,total)
        VALUES(?,?);
        `,
        [userId, total]
    );
    return orderResult;
}

function createOrders(max) {
    for (let i = 0; i < max; i++) {
        userId = genRandom(1, 5);
        total = genRandom(1, 100000);
        createOrder(userId, total);
    }
}

createOrders(rows);
console.log("end");
