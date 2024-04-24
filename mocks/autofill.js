import {
    categoryArr,
    manTitle1,
    manTitle2,
    womenTitle1,
    womenTitle2,
    accessoriesTitle1,
    accessoriesTitle2,
    descriptionArr,
    price,
    textureArr,
    wash1,
    wash2,
    placeArr,
    noteArr,
    slotAArr,
    slotBArr,
    slotCArr,
    colorArr,
    sizeArr,
} from "./randomWord.js";

function randomArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
//以下定義category
const cat = `${randomArr(categoryArr)}`;
//以下定義title
let title;
if (cat === "men") {
    title = `${randomArr(manTitle1)}${randomArr(manTitle1)}${randomArr(manTitle2)}`;
} else if (cat === "women") {
    title = `${randomArr(womenTitle1)}${randomArr(womenTitle1)}${randomArr(womenTitle2)}`;
} else if (cat === "accessories") {
    title = `${randomArr(accessoriesTitle1)}${randomArr(accessoriesTitle1)}${randomArr(accessoriesTitle2)}`;
}
//

let randomColor1 = randomArr(colorArr);
let randomColor2 = randomArr(colorArr);
let randomColor3 = randomArr(colorArr);
let stock1 = Math.floor(Math.random() * 50);
let stock2 = Math.floor(Math.random() * 50);
let stock3 = Math.floor(Math.random() * 50);

//以下Variant腳本,請改好自己前端input標籤的id屬性並調整數量(建議多設，多設的腳本會自動被無視)，腳本才抓得到
let variant = `
document.getElementById('variants[0][color_name]').value="${randomColor1[0]}";
document.getElementById('variants[0][color_code]').value="${randomColor1[1]}";
document.getElementById('variants[0][size]').value="${randomArr(sizeArr)}";
document.getElementById('variants[0][stock]').value="${stock1}";
document.getElementById('variants[1][color_name]').value="${randomColor2[0]}";
document.getElementById('variants[1][color_code]').value="${randomColor2[1]}";
document.getElementById('variants[1][size]').value="${randomArr(sizeArr)}";
document.getElementById('variants[1][stock]').value="${stock2}";
document.getElementById('variants[2][color_name]').value="${randomColor3[0]}";
document.getElementById('variants[2][color_code]').value="${randomColor3[1]}";
document.getElementById('variants[2][size]').value="${randomArr(sizeArr)}";
document.getElementById('variants[2][stock]').value="${stock3}";
`;

//以下主product腳本,請改好自己前端input標籤的id屬性腳本才抓得到
let script = `document.getElementById('category').value="${cat}"; document.getElementById('title').value="${title}";  document.getElementById('description').value="${randomArr(
    descriptionArr
)}"; document.getElementById('price').value="${price}"; document.getElementById('texture').value="${randomArr(
    textureArr
)}"; document.getElementById('wash').value="${randomArr(wash1)}${randomArr(wash2)}";  document.getElementById('place').value="${randomArr(
    placeArr
)}"; document.getElementById('note').value="${randomArr(noteArr)}"; document.getElementById('story').value="${`${randomArr(
    slotAArr
)}，適合${randomArr(slotBArr)}，專門獻給${randomArr(slotCArr)}的你。`}"; ${variant}`;
//以下庫存顏色隨機產生器

console.log(`${script}`);
