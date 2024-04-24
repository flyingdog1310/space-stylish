//-----header
let paramsString = window.location.search.substr(1);
const searchParams = new URLSearchParams(paramsString);
let category = "";
let search = "";
function loadProductList(url) {
    window.location.replace(`${window.location.origin}?${url}`);
}

$("#women").click(function () {
    loadProductList(`category=women`);
});
$("#men").click(function () {
    loadProductList(`category=men`);
});
$("#accessories").click(function () {
    loadProductList(`category=accessories`);
});
$("#search-btn").click(function () {
    const search = $("#search").val();
    window.location.replace(`${window.location.origin}?keyword=${search}`);
});
$(document).on("keypress", function (e) {
    if (e.which == 13) {
        const search = $("#search").val();
        window.location.replace(`${window.location.origin}?keyword=${search}`);
    }
});
