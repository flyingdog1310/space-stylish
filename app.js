import express from "express";
import { rateLimit } from "./util/middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.SERVER_PORT;
const apiVersion = process.env.API_VERSION;

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit);

// Swagger UI static files
app.use("/swagger", express.static(__dirname));

// Swagger UI redirect
app.get("/swagger", (req, res) => {
    res.redirect("/swagger/swagger-ui.html");
});

// Swagger YAML file service
app.get("/swagger.yaml", (req, res) => {
    res.sendFile(path.join(__dirname, "swagger.yaml"));
});

app.get("/", async (req, res) => {
    res.render("index");
});

app.get("/product", async (req, res) => {
    res.render("product");
});

app.get("/profile", async (req, res) => {
    res.render("profile");
});

app.get("/cart", async (req, res) => {
    res.render("cart");
});

app.get("/facebook", async (req, res) => {
    res.render("facebook");
});

import { adminAPI } from "./controllers/admin.js";
app.use("/admin", adminAPI);

import { productAPI } from "./controllers/product.js";
app.use(`/api/${apiVersion}/products`, productAPI);

import { marketingAPI } from "./controllers/marketing.js";
app.use(`/api/${apiVersion}/marketing`, marketingAPI);

import { userAPI } from "./controllers/user.js";
app.use(`/api/${apiVersion}/user`, userAPI);

import { orderAPI } from "./controllers/order.js";
app.use(`/api/${apiVersion}/order`, orderAPI);

import { reportAPI } from "./controllers/report.js";
app.use(`/api/${apiVersion}/report`, reportAPI);

app.get("/health-check", async (req, res) => {
    res.status(200).json("ok");
});

//404error
app.use(function (req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    console.log(`${ip} get ${req.originalUrl} not found`);
    res.status(404).json("404 Not Found");
});

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500).json("500 Internal Server Error");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
