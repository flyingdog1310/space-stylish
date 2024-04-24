let token = localStorage.getItem("jwtToken");

$("#create-campaign").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    $.ajax({
        url: "/admin/create_campaign",
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
