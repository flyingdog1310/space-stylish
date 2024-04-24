import { pool } from "../util/mysql.js";

//read--------check stock
async function getUser(user_id) {
    const [user] = await pool.query(
        `
          SELECT user.id, user.name, user.email
          FROM user
          WHERE id =?
          `,
        [user_id]
    );
    return user;
}
async function getProductVariants(order_lists) {
    let variants = [];
    for (let i = 0; i < order_lists.length; i++) {
        const [productVariants] = await pool.query(
            `
        SELECT *FROM(SELECT product.id,product.price FROM product WHERE id =?) AS product
        INNER JOIN (SELECT variants.product_id, variants.color_code,variants.size,variants.stock FROM variants
        WHERE color_code = ? AND size = ?   )AS variant 
        ON product.id = variant.product_id
          `,
            [order_lists[i].id, order_lists[i].color.code, order_lists[i].size]
        );
        variants.push(productVariants[0]);
    }
    return variants;
}

export async function checkOrder(user_id, order_lists) {
    const user = await getUser(user_id);
    const product = await getProductVariants(order_lists);
    return [...user, product];
}

//create order
export async function createOrder(
    user_id,
    shipping,
    payment,
    subtotal,
    freight,
    total,
    name,
    phone,
    email,
    address,
    time,
    rec_trade_id,
    order_lists
) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [orderResult] = await connection.query(
            `
            INSERT INTO orders (user_id,shipping,payment,subtotal,freight,total,name,phone,email,address,time,rec_trade_id)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?);
            `,
            [user_id, shipping, payment, subtotal, freight, total, name, phone, email, address, time, rec_trade_id]
        );
        for (let i = 0; i < order_lists.length; i++) {
            const [order_listsResult] = await connection.query(
                `
            INSERT INTO order_lists (order_id,product_id,name,price,color_name,color_code,size,qty)
            VALUES(?,?,?,?,?,?,?,?);
            `,
                [
                    orderResult.insertId,
                    order_lists[i].product_id,
                    order_lists[i].name,
                    order_lists[i].price,
                    order_lists[i].color_name,
                    order_lists[i].color_code,
                    order_lists[i].size,
                    order_lists[i].qty,
                ]
            );

            const [variantsResult] = await connection.query(
                `
                UPDATE variants
                SET stock = ?
                WHERE product_id=? AND color_code = ? AND size = ?
                `,
                [
                    `${order_lists[i].stock - order_lists[i].qty}`,
                    order_lists[i].product_id,
                    order_lists[i].color_code,
                    order_lists[i].size,
                ]
            );
        }
        console.log([orderResult]);
        await connection.commit();
        return [orderResult];
    } catch (err) {
        console.log(err);
        await connection.rollback();
        return err;
    } finally {
        await connection.release();
    }
}

export async function createAzoleOrder(orders) {
    const connection = await pool.getConnection();
    let orderResult = {};
    try {
        await connection.beginTransaction();
        for (let i = 0; i < orders.length; i++) {
            [orderResult] = await connection.query(
                `
            INSERT INTO orders (total)
            VALUES(?);
            `,
                [orders[i].total]
            );
            for (let j = 0; j < orders[i].list.length; j++) {
                const [order_listsResult] = await connection.query(
                    `
            INSERT INTO order_lists (order_id,product_id,price,color_name,color_code,size,qty)
            VALUES(?,?,?,?,?,?,?);
            `,
                    [
                        orderResult.insertId,
                        orders[i].list[j].id,
                        orders[i].list[j].price,
                        orders[i].list[j].color.name,
                        orders[i].list[j].color.code,
                        orders[i].list[j].size,
                        orders[i].list[j].qty,
                    ]
                );
            }
        }
        console.log([orderResult]);
        await connection.commit();
        return [orderResult];
    } catch (err) {
        console.log(err);
        await connection.rollback();
        return err;
    } finally {
        await connection.release();
    }
}
