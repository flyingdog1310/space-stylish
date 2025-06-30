TPDirect.setupSDK("12348", "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF", "sandbox");
var fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "後三碼",
  },
};
TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.ccv": {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    "input.expiration-date": {
      // 'font-size': '16px'
    },
    // Styling card-number field
    "input.card-number": {
      // 'font-size': '16px'
    },
    // style focus state
    ":focus": {
      // 'color': 'black'
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
  // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

document.getElementById("pay").addEventListener(
  "click",

  function onSubmit(event) {
    event.preventDefault();
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    const jwt = localStorage.getItem("jwtToken");
    let cart = localStorage.getItem("cart");
    cart = JSON.parse(cart);
    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
      console.log("can not get prime");
      return;
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        console.log("get prime error " + result.msg);
        return;
      }
      console.log("get prime success! prime: " + result.card.prime);
      let payment = passData(
        jwt,
        url,
        result.card.prime,
        500,
        60,
        "Ed",
        "0923588981",
        "liudahsing84@gmail.com",
        "淡水站",
        "anytime",
        cart
      );
      // send prime to your server, to pay with Pay by Prime API .
      // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    });
  }
);
let body = {};
let url = `${window.location.origin}/api/v1/order/checkout`;
function passData(jwt, url, prime, subtotal, freight, name, phone, email, address, time, list) {
  body = {
    prime: prime,
    order: {
      shipping: "delivery",
      payment: "credit_card",
      subtotal: subtotal,
      freight: freight,
      total: subtotal + freight,
      recipient: {
        name: name,
        phone: phone,
        email: email,
        address: address,
        time: time,
      },
      list: list,
    },
  };
  fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json === "out of stock") {
        alert(`很抱歉您欲購買的商品已售完，請稍待進貨後選購`);
      }
      if (json === "product not match") {
        alert(`很抱歉有東西出錯了，請您重新下單`);
      }
      if (json.data.number) {
        localStorage.removeItem("cart");
        alert(`訂單已成功建立，您的訂單編號為${json.data.number}`);
      }
    });
}
