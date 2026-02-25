// noinspection DuplicatedCode,ES6ConvertVarToLetConst

var Highcharts;


$.getJSON('/warehouse/caution/points/negative.json', function (source) {

    // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
    // https://api.highcharts.com/class-reference/Highcharts.Point#.name
    // https://api.highcharts.com/highstock/tooltip.pointFormat


    let estimates = [];


    // split the data set into ...
    for (let i = 0; i < source.length; i += 1) {

        let indices = source[i]['columns'];
        let i_max = indices.indexOf('maximum'),
            i_lat = indices.indexOf('latest'),
            i_med = indices.indexOf('median'),
            i_sta_n = indices.indexOf('station_name'),
            i_riv = indices.indexOf('river_name'),
            i_end = indices.indexOf('p_ending'),
            i_beg = indices.indexOf('p_beginning'),
            i_dr = indices.indexOf('drop');

        let visible = false;
        if (source[i]['data'][0][i_dr] < 8)
            visible = true

        let data = [];
        for (let j = 0; j < source[i]['data'].length; j += 1) {

            data.push({
                x: Math.abs(source[i]['data'][j][i_lat]), // latest
                y: Math.abs(source[i]['data'][j][i_max]), // maximum
                name: source[i]['data'][j][i_sta_n], // station name
                description: '<b>' + Highcharts.numberFormat(source[i]['data'][j][i_lat], 4) + ' mm/hr</b><br/>' +
                    '<b>maximum rate:</b> ' + Highcharts.numberFormat(source[i]['data'][j][i_max], 4) + ' mm/hr<br/>' +
                    '<b>median rate:</b> ' + Highcharts.numberFormat(source[i]['data'][j][i_med], 4) + ' mm/hr<br/>' +
                    '<b>river/water:</b> ' + source[i]['data'][j][i_riv] + '<br/><br/>' +
                    '<b>PERIOD:</b> ' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', source[i]['data'][j][i_beg]) + '<br/>' +
                    '&Rarr; ' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', source[i]['data'][j][i_end])
            });

        }

        estimates.push({
            type: 'scatter',
            name: source[i]['catchment_name'],
            data: data,
            visible: visible,
            className: source[i]['catchment_name'], // for point classification by catchment
            tooltip: {
                pointFormat: '<br/>' +
                    '<b>gauge station:</b> {point.name}<br/>' +
                    '<b>catchment:</b> {series.name}</br>' +
                    '<b>latest rate:</b> {point.description}'

            }
        });

    }


    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });


    // Draw a graph
    Highcharts.chart('container0004', {

        chart: {
            type: 'scatter',
            zoomType: 'xy',
            width: 585,
            height: 465,
            marginRight: 225,
            marginBottom: 155
        },

        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            maxHeight: 200,
            floating: true,
            y: 85
        },
        title: {
            useHTML: true,
            text: 'Rates of Change of River Levels: <b>DECREASES</b>'
        },

        subtitle: {
            useHTML: true,
            text: '<p>vis-à-vis Scotland\'s river level gauge station measures.<br><b>LOGARITHMIC AXES</b></p>'
        },

        time: {
            timezone: 'Europe/London'
        },

        credits: {
            enabled: false
        },

        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ['viewFullscreen', 'printChart', 'separator',
                        'downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'separator',
                        'downloadXLS', 'downloadCSV']
                }
            }
        },

        xAxis: {
            type: 'logarithmic',
            title: {
                text: 'latest (mm/hr)'
            },
            labels: {
                format: '{value}'
            }
        },

        yAxis: {
            type: 'logarithmic',
            labels: {
                format: '{value}'
            },
            title: {
                text: 'maximum (mm/hr)',
                x: 0
            },
            max: 1000
        },

        plotOptions: {
            series: {
                turboThreshold: 4000
            }
        },

        tooltip: {
            split: true,
            fixed: true,
            position: {
                align: 'right',
                verticalAlign: 'bottom',
                relativeTo: 'spacingBox',
                x: 30,
                y: 425
            },
            useHTML: true,
            style: {
                fontSize: 12
            },
            dateTimeLabelFormats: {
                millisecond: "%A, %e %b, %H:%M:%S.%L",
                second: "%A, %e %b, %H:%M:%S",
                minute: "%A, %e %b, %H:%M",
                hour: "%A, %e %b, %H:%M",
                day: "%A, %e %B, %Y",
                week: "%A, %e %b, %Y",
                month: "%B %Y",
                year: "%Y"
            }

        },

        series: estimates,
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    rangeSelector: {
                        inputEnabled: false
                    }
                }
            }]
        }
    });

}).fail(function () {
    console.log("Missing");
    $('#container0004').empty();
});