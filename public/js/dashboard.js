$.ajax({
    type: "GET",
    url: "/api/v1/report/total",
    success: function (data) {
        const total = data.total;
        $("#number").html(`<h1> Total Revenue : ${total}</h1>`);
    },
});
$.ajax({
    type: "GET",
    url: "/api/v1/report/sold_color_percent",
    success: function (totalSoldColor) {
        let data = [
            {
                values: [],
                labels: [],
                marker: {
                    colors: [],
                },
                type: "pie",
                textinfo: "percent",
                textposition: "inside",
                automargin: true,
            },
        ];
        let layout = {
            title: "Product sold percentage in different colors",
        };

        for (let i = 0; i < totalSoldColor.soldColor.length; i++) {
            data[0].values.push(totalSoldColor.soldColor[i].total);
            data[0].labels.push(totalSoldColor.soldColor[i].color_name);
            data[0].marker.colors.push(totalSoldColor.soldColor[i].color_code);
        }
        Plotly.newPlot("total-sold-color", data, layout);
    },
});

$.ajax({
    type: "GET",
    url: "/api/v1/report/sold_price_percent",
    success: function (soldPricePercent) {
        let data = [
            {
                x: [],
                y: [],
                type: "bar",
            },
        ];
        let layout = {
            title: "Product sold quantity in different price range",
            yaxis: {
                title: "Quantity",
            },
            xaxis: {
                title: "Price Range",
            },
        };

        for (let i = 0; i < soldPricePercent.soldPrice.length; i++) {
            data[0].x.push(soldPricePercent.soldPrice[i].price);
            data[0].y.push(soldPricePercent.soldPrice[i].amount);
        }

        console.log(data);
        Plotly.newPlot("total-sold-price", data, layout);
    },
});

$.ajax({
    type: "GET",
    url: "/api/v1/report/top-five",
    success: function (topFiveSize) {
        let size1 = {
            x: [],
            y: [],
            name: "S",
            type: "bar",
        };

        let size2 = {
            x: [],
            y: [],
            name: "M",
            type: "bar",
        };
        let size3 = {
            x: [],
            y: [],
            name: "L",
            type: "bar",
        };
        for (let i = 0; i < topFiveSize.topFive.length; i++) {
            size1.x.push(`product${topFiveSize.topFive[i].product_id}`);
            size2.x.push(`product${topFiveSize.topFive[i].product_id}`);
            size3.x.push(`product${topFiveSize.topFive[i].product_id}`);
            size1.y.push(topFiveSize.topFive[i].variants[0].total);
            size2.y.push(topFiveSize.topFive[i].variants[1].total);
            size3.y.push(topFiveSize.topFive[i].variants[2].total);
        }
        let data = [size1, size2, size3];
        var layout = {
            barmode: "stack",
            title: "Quantity of top 5 sold products in different sizes",
            hoverinfo: name,
            hovertemplate: "%{base}",
            yaxis: {
                title: "Quantity",
            },
        };
        Plotly.newPlot("top-five", data, layout);
    },
});
