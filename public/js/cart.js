let token = localStorage.getItem("jwtToken");
if (token === null) {
  window.location.replace(`${window.location.origin}/profile`);
} else {
  $.ajax({
    type: "GET",
    url: "/api/1.0/user/profile",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
  }).fail(function (err) {
    console.log(err);
    window.location.replace(`${window.location.origin}/profile`);
  });
}

let cart = localStorage.getItem("cart");
if (cart === null) {
  $("#cart-display").html("購物車中目前沒有東西唷，快去逛逛吧");
  $("#checkout").css("display", "none");
  $("#delete-cart").css("display", "none");
} else {
  cart = JSON.parse(cart);
  let item;
  let items = "";
  for (let i = 0; i < cart.length; i++) {
    item = `${`<tr><td>${cart[i].id}</td><td>${cart[i].name}</td><td>${cart[i].price}</td><td>${cart[i].color.code}</td><td>${cart[i].size}</td><td>${cart[i].qty}</td></tr>`}`;
    items += item;
  }
  $("#cart-display").html(
    `<table>
            <tr>
                <th>商品ＩＤ</th>
                <th>名稱</th>
                <th>價格</th>
                <th>顏色</th>
                <th>尺寸</th>
                <th>數量</th>
            </tr>
            ${items}
        </table>
        `
  );
}

$("#delete-cart").on("click", function () {
  localStorage.removeItem("cart");
  location.reload();
});
$("#checkout").on("click", function () {
  $("#checkout").css("display", "none");
  $("#payment").html(`<object data="/admin/checkout"  width=350px height=400px>`);
});
