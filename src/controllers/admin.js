import express from "express";
const router = express.Router();
import { verifyJWT } from "../utils/middleware.js";
import { upload } from "../config/multer.js";
import userService from "../services/userService.js";
import productService from "../services/productService.js";
import marketingService from "../services/marketingService.js";
import orderService from "../services/orderService.js";

router.use(verifyJWT);

async function getOrdersFromAzole() {
    return fetch(`http://35.75.145.100:1234/api/1.0/order/data`, {
        method: "GET",
    }).then((response) => response.json());
}

// 創建角色
router.post("/create_role", upload.array(), verifyJWT, async (req, res) => {
    try {
        const input = JSON.parse(JSON.stringify(req.body));
        const { role, access } = input;
        const newRole = await userService.createRole(role, access);
        res.json("New Role Successfully Created");
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to create role");
    }
});

// 分配角色
router.post("/assign_role", upload.array(), verifyJWT, async (req, res) => {
    try {
        const input = JSON.parse(JSON.stringify(req.body));
        const { userId, roleId } = input;
        const userRole = await userService.assignRole(userId, roleId);
        res.json("New Role Successfully Assigned");
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to assign role");
    }
});

//get-----/admin/roles
router.get("/roles", async (req, res) => {
    res.render("roles");
});

//get-----/admin/product
router.get("/product", async (req, res) => {
    res.render("create_product");
});

//get-----/admin/campaign
router.get("/campaign", async (req, res) => {
    res.render("create_campaign");
});

// 創建產品
router.post(
    "/create_product",
    upload.fields([
        { name: "main_image", maxCount: 1 },
        { name: "images", maxCount: 8 },
    ]),
    verifyJWT,
    async (req, res) => {
        try {
            const input = JSON.parse(JSON.stringify(req.body));
            const main_image = req.files.main_image[0].key;
            const images = req.files.images.map(function (obj) {
                return obj.key;
            });

            const { category, title, description, price, texture, wash, place, note, story, variants } = input;

            const productData = {
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
            };

            const newProduct = await productService.createProduct(productData);
            res.json("success");
        } catch (err) {
            console.log(err.message);
            res.status(500).json("Failed to create product");
        }
    }
);

// 創建活動
router.post("/create_campaign", upload.single("picture"), verifyJWT, async (req, res) => {
    try {
        const input = JSON.parse(JSON.stringify(req.body));
        const picture = req.file.key;
        const { product_id, story } = input;

        const campaignData = {
            product_id,
            picture,
            story
        };

        const newCampaign = await marketingService.createCampaign(campaignData);
        if (newCampaign) {
            res.json("New Campaign Successfully Created");
            return;
        }
        res.status(400).json("chosen item does not exist");
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to create campaign");
    }
});

//post------/admin/checkout
router.get("/checkout", async (req, res) => {
    res.render("checkout");
});

router.get("/dashboard", async (req, res) => {
    res.render("dashboard");
});

//TODO:return better
router.get("/get_orders", async (req, res) => {
    let orders = await getOrdersFromAzole();
    let result = await createAzoleOrder(orders);
    res.json(result);
});

export { router as adminAPI };
