let paramsString = window.location.search.substr(1);
const searchParams = new URLSearchParams(paramsString);
let id;
id = searchParams.get("id");
let info;

$.getJSON(`${window.location.origin}/api/1.0/products/details?id=${id}`, function (products) {
    info = products;
    $("#product-main-img").prop(`src`, `${products.data.main_image}`);
    $(`#product-title`).text(`${products.data.title}`);
    $(`#product-id`).text(`${products.data.id}`);
    $(`#product-price`).text(`NTD.${products.data.price}`);
    for (let i = 0; i < products.data.colors.length; i++) {
        $("<input>", {
            type: "radio",
            name: "color",
            value: `${products.data.colors[i].code}`,
            id: `product-color-input${i}`,
            class: `product-color-input`,
        }).appendTo(`#product-color`);
        $("<label>", {
            id: `product-color-block${i}`,
            for: `product-color-input${i}`,
            class: `product-color-blocks`,
            style: `background-color: #${products.data.colors[i].code}`,
        }).appendTo(`#product-color`);
    }
    for (let i = 0; i < products.data.sizes.length; i++) {
        $("<input>", {
            type: "radio",
            name: "size",
            value: `${products.data.sizes[i]}`,
            id: `product-size-input${i}`,
            class: `product-size-input`,
            disabled: true,
        }).appendTo(`#product-size`);
        $("<label>", {
            id: `product-size-block${i}`,
            for: `product-size-input${i}`,
            class: `product-size-block`,
        })
            .text(`${products.data.sizes[i]}`)
            .appendTo(`#product-size`);
    }
    $(`#product-note`).text(`${products.data.note}`);
    $(`#product-texture`).text(`材質：${products.data.texture}`);
    $(`#product-description`).text(`${products.data.description}`);
    $(`#product-place`).text(`產地：${products.data.place}`);
    $(`#product-story`).text(`${products.data.story}`);
    for (let i = 0; i < products.data.images.length; i++) {
        $("<img>", {
            src: `${products.data.images[i]}`,
            id: `product-image${i}`,
            class: `product-images`,
        }).appendTo(`#product-images`);
    }
});
let chosenColor;
let chosenSize;
let size;
let stock;
let qty;

$("#variants-form").on("change", function (e) {
    $("#add-cart").text("請選擇顏色");
    chosenColor = $("input[name=color]:checked").val();
    chosenSize = $("input[name=size]:checked").val();
    size = [];
    qty = 1;
    stock = undefined;
    $("#add-cart").prop("disabled", true);
    $("#qty").val(qty);
    $("#stock").text("");
    $("#plus, #minus").off("click");
    if (chosenColor !== undefined) {
        $("#add-cart").text("請選擇尺寸");
        for (let i = 0; i < info.data.variants.length; i++) {
            if (info.data.variants[i].color_code === chosenColor) {
                size.push(info.data.variants[i].size);
            }
        }
        for (let i = 0; i < size.length; i++) {
            for (let j = i; j < info.data.sizes.length; j++)
                if ($(`#product-size-input${j}`).val() === size[i]) {
                    $(`#product-size-input${j}`).prop("disabled", false);
                } else {
                    $(`#product-size-input${j}`).prop("checked", false);
                    $(`#product-size-input${j}`).prop("disabled", true);
                }
        }
        if (chosenSize !== undefined) {
            $("#add-cart").text("加入購物車");
            $("#add-cart").prop("disabled", false);
            for (let i = 0; i < info.data.variants.length; i++) {
                if (info.data.variants[i].color_code === chosenColor && info.data.variants[i].size === chosenSize) {
                    stock = info.data.variants[i].stock;
                }
            }

            if (stock === undefined) {
                $("#stock").text("");
                $("#add-cart").text("請選擇尺寸");
                $("#add-cart").prop("disabled", true);
            } else if (stock == "0") {
                $("#stock").text(`目前暫時缺貨`);
                $("#add-cart").text("已售完");
                $("#add-cart").prop("disabled", true);
            } else {
                $("#stock").text(`目前存貨：${stock}`);
            }
            $("#plus")
                .off("click")
                .on("click", function (e) {
                    if (qty < stock) {
                        qty += 1;

                        $("#qty").val(qty);
                    }
                    e.stopPropagation();
                });
            $("#minus")
                .off("click")
                .on("click", function (e) {
                    if (qty > 1) {
                        qty -= 1;
                        $("#qty").val(qty);
                    }
                    e.stopPropagation();
                });
            $("#qty").prop("max", stock);
        }
    }
    e.stopPropagation();
});

$("#variants-form").submit(function (e) {
    e.preventDefault();
    let cart = localStorage.getItem("cart");
    if (cart === null) {
        cart = [];
    } else {
        cart = JSON.parse(cart);
    }
    let newProduct = {
        id: info.data.id,
        name: info.data.title,
        price: info.data.price,
        color: { code: chosenColor },
        size: chosenSize,
        qty: qty,
    };
    cart.push(newProduct);
    cart = JSON.stringify(cart);
    localStorage.setItem("cart", cart);
    alert("商品已成功加入購物車");
});
