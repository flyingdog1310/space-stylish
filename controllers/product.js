import express from "express";
const router = express.Router();
import { getProduct, getProductSearch, getProductDetail } from "../models/product.js";
import { staticUrlFixer } from "../util/url.js";

//get ----/products/:category
router.get(["/all", "/men", "/women", "/accessories"], async (req, res) => {
    const category = req.path.slice(1);
    let page = Math.floor(req.query.paging) || 0;
    if (isNaN(page) || page < 0) {
        res.status(403).json("Page number should be positive integer");
        return;
    }
    const productList = await getProduct(category, page);
    if (productList.length === 0) {
        res.status(400).json("No product in this page.");
        return;
    }
    productList[0] = staticUrlFixer(productList[0], "main_image");
    res.status(200).json({ data: productList[0] });
    return;
});

//get ------/products/search
router.get("/search", async (req, res) => {
    let keyword = req.query.keyword;
    let page = Math.floor(req.query.paging) || 0;
    if (!keyword) {
        res.status(400).json("keyword is required.");
        return;
    }
    if (isNaN(page) || page < 0) {
        res.status(403).json("Page number should be positive integer");
        return;
    }
    const productList = await getProductSearch(keyword, page);
    if (productList.length === 0) {
        res.status(400).json("No product in this page.");
        return;
    }
    productList[0] = staticUrlFixer(productList[0], "main_image");
    res.status(200).json({ data: productList[0] });
    return;
});

//get------/products/details
router.get("/details", async (req, res) => {
    const id = req.query.id;
    if (id) {
        let search = await getProductDetail(id);
        if (search === 0) {
            res.status(400).json("This product does not exist.");
            return;
        } else {
            search = staticUrlFixer(search, "main_image");
            res.json({ data: search[0] });
            return;
        }
    }
    res.status(400).json("Offer product id for detail, please.");
    return;
});

export { router as productAPI };
