let paramsString = window.location.search.substr(1);
const searchParams = new URLSearchParams(paramsString);
let category = "";
let search = "";
let campaigns;
let products;

$.getJSON(`${window.location.origin}/api/1.0/marketing/campaigns`, function (campaigns) {
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
if (search == "") {
    $.getJSON(`${window.location.origin}/api/1.0/products/${category}`, function (products) {
        if (products.data === undefined) {
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
    });
}

if (search !== "") {
    $.getJSON(`${window.location.origin}/api/1.0/products/search?keyword=${search}`, function (products) {
        if (products.data === undefined) {
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
    });
}
