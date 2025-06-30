let token = localStorage.getItem("jwtToken");

$("#create-role").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    $.ajax({
        url: "/api/v1/admin/create_role",
        type: "POST",
        headers: {
            Authorization: "Bearer " + token,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log(data);
            alert("創建新組合成功");
        },
        error: function (xhr, textStatus, error) {
            console.log(error);
            alert("權限不足");
        },
    });
});
$("#assign-role").submit(function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    $.ajax({
        url: "/admin/assign_role",
        type: "POST",
        headers: {
            Authorization: "Bearer " + token,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            alert("指派權限成功");
        },
        error: function (xhr, textStatus, error) {
            console.log(error);
            alert("權限不足");
        },
    });
});
