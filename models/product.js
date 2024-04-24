import { pool } from "../util/mysql.js";
import { redis } from "../util/redis.js";
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
        const [productResult] = await pool.query(
            `
        INSERT INTO product (category,title, description, price, texture,wash,place,note, story,main_image)
        VALUES(?,?,?,?,?,?,?,?,?,?);
        `,
            [category, title, description, price, texture, wash, place, note, story, main_image]
        );
        for (let i = 0; i < variants.length; i++) {
            const [variantsResult] = await pool.query(
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
            const [imagesResult] = await pool.query(
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
        console.log(err);
        return err;
    }
}

//---------------Product List API--------------------------------------

function getDistinctColors(variants) {
    const colors = [];
    const colorMap = {};
    for (const i in variants) {
        if (!colorMap[variants[i].color_code]) {
            colorMap[variants[i].color_code] = true;
            colors.push({ code: variants[i].color_code, name: variants[i].color_name });
        }
    }
    return colors;
}

function getDistinctSizes(variants) {
    const sizes = [];
    const sizeMap = {};
    for (const i in variants) {
        if (!sizeMap[variants[i].size]) {
            sizeMap[variants[i].size] = true;
            sizes.push(variants[i].size);
        }
    }
    return sizes;
}

async function getVariants(id) {
    const [variants] = await pool.query(
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
}

async function getImages(id) {
    const [rows] = await pool.query(
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
    let images = await rows.map(function (obj) {
        return obj.image;
    });
    return images;
}

async function getProduct(category, paging) {
    let products;
    let pages;
    if (category == "all") {
        [products] = await pool.query(
            `
        SELECT 
            product.id, product.category, product.title, product.description, product.price, product.texture, product.wash, product.place, product.note, product.story, product.main_image
        FROM 
            product 
        LIMIT 
            ? , 6
        `,
            [paging * 6]
        );
        [[pages]] = await pool.query(
            `
        SELECT 
            COUNT(*)
        FROM 
            product 
        `
        );
    } else {
        [products] = await pool.query(
            `
        SELECT 
            product.id, product.category, product.title, product.description, product.price, product.texture, product.wash, product.place, product.note, product.story, product.main_image
        FROM 
            product 
        WHERE 
            product.category = ?
        LIMIT 
            ? , 6
        `,
            [category, paging * 6]
        );
        [[pages]] = await pool.query(
            `
        SELECT 
            COUNT(*)
        FROM 
            product 
        WHERE 
            product.category= ?
        `,
            [category]
        );
    }
    let final = [];
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
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
    return [final, pages["COUNT(*)"]];
}
//--------------Product Search API-------------------------------------

async function getProductSearch(keyword, paging) {
    let [products] = await pool.query(
        `
      SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
      FROM product 
      WHERE product.title LIKE ?
      LIMIT ? , 6
      `,
        [`%${keyword}%`, paging * 6]
    );
    let [[pages]] = await pool.query(
        `
        SELECT COUNT(*)
        FROM product 
        WHERE product.title LIKE ?
        `,
        [`%${keyword}%`]
    );
    let final = [];
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
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
    return [final, pages["COUNT(*)"]];
}

//------------- Product Detail API-------------------------------------
async function getProductDetail(id) {
    let [rows] = await pool.query(
        `
      SELECT product.id, product.category,product.title,product.description,product.price,product.texture,product.wash,product.place,product.note,product.story,product.main_image
      FROM product 
      WHERE product.id = ?
      `,
        [id]
    );
    if (rows.length === 0) {
        return 0;
    } else {
        let final = [];
        for (let i = 0; i < rows.length; i++) {
            let product = rows[i];
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
        return final;
    }
}

export { getProduct, getProductSearch, getProductDetail, getVariants, getImages, createProduct };
