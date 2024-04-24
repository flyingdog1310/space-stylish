import express from "express";
const router = express.Router();
import { verifyJWT } from "../util/middleware.js";
import { upload } from "../util/multer.js";
import { createProduct } from "../models/product.js";
import { createCampaign } from "../models/marketing.js";
import { createRole, assignRole, getUserAccess } from "../models/user.js";
import { createAzoleOrder } from "../models/order.js";

router.use(verifyJWT);

async function getOrdersFromAzole() {
    return fetch(`http://35.75.145.100:1234/api/1.0/order/data`, {
        method: "GET",
    }).then((response) => response.json());
}

//create-----/admin/create_role
router.post("/create_role", upload.array(), verifyJWT, async (req, res) => {
    const input = JSON.parse(JSON.stringify(req.body));
    const { role, access } = input;
    const newRole = await createRole(role, access);
    res.json("New Role Successfully Created");
});
//create-----/admin/assign_role
router.post("/assign_role", upload.array(), verifyJWT, async (req, res) => {
    const input = JSON.parse(JSON.stringify(req.body));
    const { userId, roleId } = input;
    const userRole = await assignRole(userId, roleId);
    res.json("New Role Successfully Assigned");
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

//create ----/admin/create_product
router.post(
    "/create_product",
    upload.fields([
        { name: "main_image", maxCount: 1 },
        { name: "images", maxCount: 8 },
    ]),
    verifyJWT,
    async (req, res) => {
        const input = JSON.parse(JSON.stringify(req.body));
        const main_image = req.files.main_image[0].key;
        const images = req.files.images.map(function (obj) {
            return obj.key;
        });

        const { category, title, description, price, texture, wash, place, note, story, variants } = input;

        const newProduct = await createProduct(
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
        );
        res.json("success");
    }
);
//create ----/admin/create_campaign
router.post("/create_campaign", upload.single("picture"), verifyJWT, async (req, res) => {
    const input = JSON.parse(JSON.stringify(req.body));
    const picture = req.file.key;
    const { product_id, story } = input;
    const newCampaign = await createCampaign(product_id, picture, story);
    if (newCampaign) {
        res.json("New Product Successfully Created");
        return;
    }
    res.status(400).json("chosen item does not exist");
    return;
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
