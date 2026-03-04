// noinspection DuplicatedCode,ES6ConvertVarToLetConst

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/quantiles/menu/menu.json';


$.getJSON(url, function (data) {

    $.each(data, function (key, entry) {
        dropdown.append($('<option></option>').attr('value', entry.desc).text(entry.name));
    });

    // Load the first Option by default
    var defaultOption = dropdown.find("option:first-child").val();
    optionSelected = dropdown.find("option:first-child").text();

    // Generate
    generateChart(defaultOption);

});


// Dropdown
dropdown.on('change', function (e) {

    $('#option_selector_title').remove();

    // Save name and value of the selected option
    optionSelected = this.options[e.target.selectedIndex].text;
    var valueSelected = this.options[e.target.selectedIndex].value;

    //Draw the Chart
    generateChart(valueSelected);
});


// Generate graphs
function generateChart(fileNameKey) {


    let attributes = [];


    $.getJSON('/warehouse/quantiles/aggregates/aggregates.json', function (base) {
        attributes = base[fileNameKey];
    });


    // Relative to Amazon S3 (Simple Storage Service) Set Up
    $.getJSON('/warehouse/quantiles/points/' + fileNameKey + '.json', function (source) {

        // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
        // https://api.highcharts.com/class-reference/Highcharts.Point#.name
        // https://api.highcharts.com/highstock/tooltip.pointFormat


        // split the data set into ohlc and medians
        var medians = [],

            column = [],
            dataLength = source.data.length,
            groupingUnits = [[
                'day',   // unit name
                [1]      // allowed multiples
            ]],
            i = 0;

        for (i; i < dataLength; i += 1) {

            medians.push({
                x: source.data[i][0], // the date
                y: source.data[i][3] // median
            });

            column.push({
                x: source.data[i][0], // the date
                low: source.data[i][6], // minimum
                high: source.data[i][7] // maximum

            });

        }

        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });

        // Draw a graph
        Highcharts.stockChart('container0003', {

            rangeSelector: {
                selected: 0,
                verticalAlign: 'top',
                floating: false,
                inputPosition: {
                    x: 0,
                    y: 0
                },
                buttonPosition: {
                    x: 0,
                    y: 0
                },
                inputEnabled: true,
                inputDateFormat: '%Y-%m-%d'
            },

            chart: {
                zoomType: 'xy',
                width: 535,
                height: 485
            },

            colorAxis: [{
                stops: [
                    [0, '#ffa500'],
                    [0.5, '#000000'],
                    [1, '#722f37']
                ]
            }],

            title: {
                text: 'River Level Extrema, etc.: ' + source['station_name']
            },

            subtitle: {
                text: '<p><br/><b>River/Water Spot:</b> ' + source['river_name'] + ', <b>Catchment:</b> ' +
                    source['catchment_name'] + '</p>'
            },

            time: {
                // timezone: 'Europe/London'
            },

            credits: {
                enabled: false
            },

            caption: {
                text: '<p></p>'
            },

            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [ 'viewFullscreen', 'printChart', 'separator',
                            'downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG' , 'separator',
                            'downloadXLS', 'downloadCSV']
                    }
                }
            },

            xAxis: {
                type: 'datetime',
                crosshair: {
                    enabled: true
                },
                dateTimeLabelFormats: {
                    second:"%e %b<br>%H:%M:%S",
                    minute:"%e %b<br>%H:%M",
                    hour:"%e %b<br>%H:%M",
                    day: "%a, %e %B<br>%Y",
                    week: "%a, %e %b<br>%Y",
                    month: "%B %Y",
                    year: "%Y"
                },
                labels: {
                    format: '{value:%e %b<br>%Y }'
                },
                title: {

                }
            },

            yAxis: [{
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'extrema<br>(metres)',
                    x: 0
                },
                height: '69%',
                lineWidth: 2,
                resize: {
                    enabled: true
                },
                plotLines: [
                    {
                        value: attributes['e_u_whisker'],
                        color: '#ff9202',
                        width: 0.85,
                        label: {
                            y: -6,
                            useHTML: true,
                            style: {
                                color: '#ff9202'
                            },
                            text: '95<sup>th</sup> pcl. ' + attributes['e_u_whisker'] + 'm'
                        }
                    },
                    {
                        value: attributes['e_l_whisker'],
                        color: '#6b9771',
                        width: 0.85,
                        label: {
                            y: 10,
                            useHTML: true,
                            style: {
                                color: '#6b9771'
                            },
                            text: '5<sup>th</sup> pcl. ' + attributes['e_l_whisker'] + 'm'
                        }
                    }
                ]
            }, {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'median<br>(metres)',
                    x: 0
                },
                top: '72.5%',
                height: '26%',
                offset: 0,
                lineWidth: 2
            }
            ],

            plotOptions: {
                series: {
                    turboThreshold: 4000
                }
            },

            tooltip: {
                split: true,
                dateTimeLabelFormats: {
                    millisecond: "%a, %e %b, %H:%M:%S.%L",
                    second: "%a, %e %b, %H:%M:%S",
                    minute: "%a, %e %b, %H:%M",
                    hour: "%a, %e %b, %H:%M",
                    day: "%a, %e %B, %Y",
                    week: "%a, %e %b, %Y",
                    month: "%B %Y",
                    year: "%Y"
                }

            },

            series: [
                {
                    name: 'range',
                    data: column,
                    type: 'columnrange',
                    turboThreshold: 4000,
                    pointWidth: 5,
                    dataGrouping: {
                        enabled: true,
                        units: [[
                            'day',                         // unit name
                            [1]                            // allowed multiples
                        ]],
                        dateTimeLabelFormats: {
                            millisecond: ['%a, %e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                            second: ['%a, %e %b, %H:%M:%S', '-%H:%M:%S'],
                            minute: ['%a, %e %b, %H:%M', '-%H:%M'],
                            hour: ['%a, %e %b, %H:%M', '-%H:%M'],
                            day: ['%a, %e %b, %Y', '%a, %e %b', '-%a, %e %b, %Y'],
                            week: ['Week from %a, %e %b, %Y', '%a, %e %b', '-%a, %e %b, %Y'],
                            month: ['%B %Y', '%B', '-%B %Y'],
                            year: ['%Y', '%Y', '-%Y']
                        }
                    },
                    tooltip: {
                        pointFormat: '<br/><span style="color:{point.color}">\u25CF</span> <b> {series.name} </b>: ' +
                            '{point.low:,.3f}m - {point.high:,.3f}m<br/>'
                    }
                },
                {
                    type: 'spline',
                    name: 'Median',
                    data: medians,
                    color: '#6B8E23',
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name} </b>: ' +
                            '{point.y:,.2f} m<br/>'
                    }
                }
            ]
        });

    }).fail(function () {
        console.log("Missing");
        $('#container0003').empty();
    });

}
