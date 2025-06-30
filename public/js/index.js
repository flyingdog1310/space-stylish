let paramsString = window.location.search.substr(1);
const searchParams = new URLSearchParams(paramsString);
let category = "";
let search = "";
let campaigns;
let products;

$.getJSON(`${window.location.origin}/api/v1/marketing/campaigns`, function (campaigns) {
    $("#campaign-picture").prop("src", `${campaigns.data[0].picture}`);
    $("#campaign-link").prop(`href`, `${window.location.origin}/product?id=${campaigns.data[0].product_id}`);
    const storyAll = campaigns.data[0].story;
    const story = storyAll.split(/\r?\n/);
    $("#campaign-story0").text(story[0]);
    $("#campaign-story1").text(story[1]);
    $("#campaign-story2").text(story[2]);
    $("#campaign-foot").text(story[3]);
});

if (searchParams.get("category") == null) {
    category = "all";
}
if (
    searchParams.get("category") === "all" ||
    searchParams.get("category") === "women" ||
    searchParams.get("category") === "men" ||
    searchParams.get("category") === "accessories"
) {
    category = searchParams.get("category");
}
if (searchParams.get("keyword") !== null) {
    search = searchParams.get("keyword");
}

// 使用 ProductAPI 類別來獲取產品
async function loadProducts() {
    try {
        if (search == "") {
            const products = await window.ProductAPI.getProducts(category);
            displayProducts(products);
        } else {
            const products = await window.ProductAPI.searchProducts(search);
            displayProducts(products);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        $(".product-row").css("display", "none");
        $("#no-result").text("currently no product to show");
    }
}

// 顯示產品的函數
function displayProducts(products) {
    if (products.data === undefined || products.data.length === 0) {
        $(".product-row").css("display", "none");
        $("#no-result").text("currently no product to show");
        return;
    }

    if (products.data.length <= 3) {
        $("#bottom-row").css("display", "none");
    }

    for (let i = 0; i < products.data.length; i++) {
        $(`#product${i}`).prop(`href`, `${window.location.origin}/product?id=${products.data[i].id}`);
        $(`#product${i}-img`).ready(function () {
            $(`#product${i}-img`).css("background-image", `url(${products.data[i].main_image})`);
        });
        for (let j = 0; j < products.data[i].colors.length; j++) {
            $("<div>", {
                id: `product${i}-color-block${j}`,
                class: `product-color-block`,
                style: `background-color: #${products.data[i].colors[j].code}`,
            }).appendTo(`#product${i}-color`);
        }
        $(`#product${i}-name`).ready(function () {
            $(`#product${i}-name`).text(products.data[i].title);
        });
        $(`#product${i}-price`).ready(function () {
            $(`#product${i}-price`).text(`TWD.${products.data[i].price}`);
        });
    }
}

// 載入產品
loadProducts();
