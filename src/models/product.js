import { dbManager } from "../config/database.js";
import { redisManager } from "../config/redis.js";
//---------------Create Product----------------------------------------
async function createProduct(
    category,
    title,
    description,
    price,
    texture,
    wash,
    place,
    note,
    story,
    variants,
    main_image,
    images
) {
    try {
        const [productResult] = await dbManager.query(
            `
        INSERT INTO product (category,title, description, price, texture,wash,place,note, story,main_image)
        VALUES(?,?,?,?,?,?,?,?,?,?);
        `,
            [category, title, description, price, texture, wash, place, note, story, main_image]
        );
        for (let i = 0; i < variants.length; i++) {
            const [variantsResult] = await dbManager.query(
                `
        INSERT INTO variants (product_id,color_name,color_code,size,stock)
        VALUES(?,?,?,?,?);
        `,
                [
                    productResult.insertId,
                    variants[i].color_name,
                    variants[i].color_code,
                    variants[i].size,
                    variants[i].stock,
                ]
            );
        }
        for (let i = 0; i < images.length; i++) {
            const [imagesResult] = await dbManager.query(
                `
        INSERT INTO images (product_id,image)
        VALUES(?,?);
        `,
                [productResult.insertId, images[i]]
            );
        }
        console.log(productResult);
        return [productResult];
    } catch (err) {
        throw err;
        return err;
    }
}

//---------------Product List API--------------------------------------

function getDistinctColors(variants) {
    const colors = [];
    const colorMap = {};
    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (variant && variant.color_code && !colorMap[variant.color_code]) {
            colorMap[variant.color_code] = true;
            colors.push({ code: variant.color_code, name: variant.color_name });
        }
    }
    return colors;
}

function getDistinctSizes(variants) {
    const sizes = [];
    const sizeMap = {};
    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (variant && variant.size && !sizeMap[variant.size]) {
            sizeMap[variant.size] = true;
            sizes.push(variant.size);
        }
    }
    return sizes;
}

async function getVariants(id) {
    try {
        const variants = await dbManager.query(
            `
        SELECT
            variants.color_name, variants.color_code, variants.size, variants.stock
        FROM
            variants
        WHERE
            product_id = ?
        `,
            [id]
        );

        return variants;
    } catch (error) {
        console.error("Error in getVariants:", error);
        return [];
    }
}

async function getImages(id) {
    try {
        const rows = await dbManager.query(
            `
        SELECT
            images.image
        FROM
            images
        WHERE
            product_id = ?
        `,
            [id]
        );
        const images = rows.map(function (obj) {
            return process.env.STATIC_URL + obj.image;
        });
        return images;
    } catch (error) {
        console.error("Error in getImages:", error);
        return [];
    }
}

// 分離 SQL 查詢邏輯
function buildProductQuery(category, offset, limit) {
    const baseSelect = `
        SELECT
            product.id, product.category, product.title, product.description,
            product.price, product.texture, product.wash, product.place,
            product.note, product.story, product.main_image
        FROM product
    `;

    if (category === "all" || !category) {
        return {
            sql: `${baseSelect} LIMIT ${offset}, ${limit}`,
            params: [],
        };
    } else {
        return {
            sql: `${baseSelect} WHERE product.category = ? LIMIT ${offset}, ${limit}`,
            params: [category],
        };
    }
}

function buildCountQuery(category) {
    const baseCount = `SELECT COUNT(*) as total FROM product`;

    if (category === "all" || !category) {
        return {
            sql: baseCount,
            params: [],
        };
    } else {
        return {
            sql: `${baseCount} WHERE product.category = ?`,
            params: [category],
        };
    }
}

async function getProduct(category, paging) {
    try {
        // 參數驗證和轉換
        const offset = Math.max(0, Number.isInteger(paging) ? paging * 6 : 0);
        const limit = 6;
        const allowedCategories = ["all", "women", "men", "accessories"];

        if (!allowedCategories.includes(category)) {
            return [[], 0];
        }

        // 構建查詢
        const productQuery = buildProductQuery(category, offset, limit);
        const countQuery = buildCountQuery(category);

        // 執行查詢並加強防呆
        const products = await dbManager.query(productQuery.sql, productQuery.params);
        const countResult = await dbManager.query(countQuery.sql, countQuery.params);

        if (!Array.isArray(products) || !Array.isArray(countResult)) {
            return [[], 0];
        }

        const pages = countResult[0]?.total || countResult[0]?.["COUNT(*)"] || 0;

        if (!Array.isArray(products)) {
            return [[], 0];
        }

        // 處理產品資料
        const final = await Promise.all(
            products.map(async (product) => {
                const variants = await getVariants(product.id);
                const images = await getImages(product.id);

                return {
                    ...product,
                    main_image: process.env.STATIC_URL + product.main_image,
                    colors: getDistinctColors(variants),
                    sizes: getDistinctSizes(variants),
                    variants: variants.map((v) => {
                        const { color_name, ...rest } = v;
                        return rest;
                    }),
                    images,
                };
            })
        );

        return [final, pages];
    } catch (error) {
        return [[], 0];
    }
}

//--------------Product Search API-------------------------------------

async function getProductSearch(keyword, paging) {
    try {
        const offset = Math.max(0, Number.isInteger(paging) ? paging * 6 : 0);
        const limit = 6;

        const products = await dbManager.query(
            `
          SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
          FROM product
          WHERE product.title LIKE ?
          LIMIT ?, 6
          `,
            [`%${keyword}%`, offset]
        );

        const countResult = await dbManager.query(
            `
            SELECT COUNT(*)
            FROM product
            WHERE product.title LIKE ?
            `,
            [`%${keyword}%`]
        );

        if (!Array.isArray(products) || !Array.isArray(countResult)) {
            return [[], 0];
        }

        const pages = countResult[0]?.["COUNT(*)"] || 0;

        const final = [];
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            product.main_image = process.env.STATIC_URL + product.main_image;
            let variants = await getVariants(product.id);
            product.colors = getDistinctColors(variants);
            product.sizes = getDistinctSizes(variants);
            for (let i = 0; i < variants.length; i++) {
                delete variants[i].color_name;
            }
            product.variants = variants;
            product.images = await getImages(product.id);
            final.push(product);
        }

        return [final, pages];
    } catch (error) {
        return [[], 0];
    }
}

//------------- Product Detail API-------------------------------------
async function getProductDetail(id) {
    try {
        const rows = await dbManager.query(
            `
          SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
          FROM product
          WHERE product.id = ?
          `,
            [id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return 0;
        }

        const final = [];
        for (let i = 0; i < rows.length; i++) {
            let product = rows[i];
            product.main_image = process.env.STATIC_URL + product.main_image;
            let variants = await getVariants(product.id);
            product.colors = getDistinctColors(variants);
            product.sizes = getDistinctSizes(variants);
            for (let i = 0; i < variants.length; i++) {
                delete variants[i].color_name;
            }
            product.variants = variants;
            product.images = await getImages(product.id);
            final.push(product);
        }

        return final[0];
    } catch (error) {
        return 0;
    }
}

export { getProduct, getProductSearch, getProductDetail, getVariants, getImages, createProduct };
