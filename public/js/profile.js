if (localStorage.getItem("jwtToken") == null) {
    $("<h1>", {}).text("請註冊或登入後繼續").appendTo(`#sign-up`);
    $("<button>", {
        type: "button",
        id: `sign-up-btn`,
        class: `btn`,
    })
        .text("點此註冊會員")
        .appendTo(`#sign-up`);
    $("<button>", {
        type: "button",
        id: `sign-in-btn`,
        class: `btn`,
    })
        .text("點此登入會員")
        .appendTo(`#sign-in`);
}
if (localStorage.getItem("jwtToken") !== null) {
    let token = localStorage.getItem("jwtToken");
    $.ajax({
        type: "GET",
        url: "/api/1.0/user/profile",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        },
    })
        .done(function (response) {
            console.log(response);
            if (response.data.picture === null) {
                $("<img>", {
                    id: "picture",
                    src: `/public/ui/who_pokemon.jpg`,
                    width: "500px",
                }).appendTo(`#profile`);
            } else {
                $("<img>", {
                    id: "picture",
                    src: `${response.data.picture}`,
                }).appendTo(`#profile`);
            }
            $("<div>", {
                id: "provider",
            })
                .text(`Provider: ${response.data.provider}`)
                .appendTo(`#profile`);
            $("<div>", {
                id: "name",
            })
                .text(`Name: ${response.data.name}`)
                .appendTo(`#profile`);
            $("<div>", {
                id: "email",
            })
                .text(`Email: ${response.data.email}`)
                .appendTo(`#profile`);
            $("<button>", {
                type: "button",
                id: "log-out-btn",
                class: "btn",
            })
                .text(`會員登出`)
                .appendTo(`#profile`);
        })
        .fail(function (err) {
            localStorage.removeItem("jwtToken");
            console.log(err.responseJSON);
            location.reload();
        });
}

$(document).on("click", "#log-out-btn", function () {
    localStorage.removeItem("jwtToken");
    location.reload();
});

$(`#sign-up-btn`).on("click", function () {
    $("<label>", {
        for: `sign-up-name`,
        class: `label`,
    })
        .text("name:")
        .appendTo(`#sign-up`);
    $("<input>", {
        type: "text",
        name: "name",
        id: `sign-up-name`,
        class: `input`,
        required: true,
    }).appendTo(`#sign-up`);
    $("<label>", {
        for: `sign-up-email`,
        class: `label`,
    })
        .text("email:")
        .appendTo(`#sign-up`);
    $("<input>", {
        type: "email",
        name: "email",
        id: `sign-up-emil`,
        class: `input`,
        required: true,
    }).appendTo(`#sign-up`);
    $("<label>", {
        for: `sign-up-password`,
        class: `label`,
    })
        .text("password:")
        .appendTo(`#sign-up`);
    $("<input>", {
        type: "password",
        name: "password",
        id: `sign-up-password`,
        class: `input`,
        required: true,
    }).appendTo(`#sign-up`);
    $("<button>", {
        type: "submit",
        id: `sign-up-submit`,
        class: `btn`,
    })
        .appendTo(`#sign-up`)
        .text("註冊會員");
    $(`#sign-up-btn`).css("display", "none");
});

$(`#sign-in-btn`).on("click", function () {
    $("<input>", {
        type: "text",
        name: "provider",
        id: `sign-in-provider`,
        class: `input`,
        value: `native`,
        required: true,
    })
        .css("display", "none")
        .appendTo(`#sign-in`);
    $("<label>", {
        for: `sign-in-email`,
        class: `label`,
    })
        .text("email:")
        .appendTo(`#sign-in`);
    $("<input>", {
        type: "email",
        name: "email",
        id: `sign-in-emil`,
        class: `input`,
        required: true,
    }).appendTo(`#sign-in`);
    $("<label>", {
        for: `sign-in-password`,
        class: `label`,
    })
        .text("password:")
        .appendTo(`#sign-in`);
    $("<input>", {
        type: "password",
        name: "password",
        id: `sign-in-password`,
        class: `input`,
        required: true,
    }).appendTo(`#sign-in`);
    $("<button>", {
        type: "submit",
        id: `sign-in-submit`,
        class: `btn`,
    })
        .appendTo(`#sign-in`)
        .text("登入會員");
    $(`#sign-in-btn`).css("display", "none");
});

$("#sign-up").submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/api/1.0/user/signup",
        type: "post",
        data: $("#sign-up").serialize(),
        success: function (data) {
            console.log(data.data.access_token);
            let token = data.data.access_token;
            localStorage.setItem("jwtToken", token);
            console.log(data);
            location.reload(true);
        },
    });
});
$("#sign-in").submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/api/1.0/user/signin",
        type: "post",
        data: $("#sign-in").serialize(),
        success: function (data) {
            console.log(data.data.access_token);
            let token = data.data.access_token;
            localStorage.setItem("jwtToken", token);
            console.log(data);
            location.reload(true);
        },
    });
});
