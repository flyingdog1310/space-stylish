let i = 1;

document.getElementById("more_variants").addEventListener("click", function () {
    const appendPlace = document.getElementById(`variants_form${i}`);
    const newVariants = `
      <label for="color_name">color name: </label>
      <input id="variants[${i}][color_name]" name="variants[${i}][color_name]" type="text" placeholder="白色" required="required" />
      <label for="color_code">color code: </label>
      <input id="variants[${i}][color_code]" name="variants[${i}][color_code]" type="text" placeholder="FFFFFF" required="required" />
      <label for="size">size: </label>
      <select id="variants[${i}][size]" name="variants[${i}][size]" required="required" >
          <option value="XS"> XS </option>
          <option value="S" > S </option>
          <option value="M" > M </option>
          <option value="L" > L </option>
          <option value="XL"> XL </option>
          <option value="2XL"> 2XL </option>
      </select>
      <label for="stock">stock: </label>
      <input id="variants[${i}][stock]" name="variants[${i}][stock]" type="number" placeholder="5" min="0" max="32767" required="required" />
      <div id="variants_form${i + 1}"></div>`;
    appendPlace.innerHTML = newVariants;
    i++;
});

let token = localStorage.getItem("jwtToken");

$("#product-form").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    $.ajax({
        url: "/admin/create_product",
        type: "POST",
        headers: {
            Authorization: "Bearer " + token,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log(data);
            alert("創造商品成功");
        },
        error: function (xhr, textStatus, error) {
            console.log(error);
            alert("權限不足");
        },
    });
});
