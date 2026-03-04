// noinspection DuplicatedCode,ES6ConvertVarToLetConst

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/split/menu/menu.json';


// Dropdown data
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
function generateChart(fileNameKey){


    let attributes = [];


    $.getJSON('/warehouse/quantiles/aggregates/aggregates.json', function (base) {
        attributes = base[fileNameKey];
    });


    $.getJSON('/warehouse/split/points/' + fileNameKey + '.json', function (source)  {


        // definitions
        let sectors = [],
            groupingUnits = [[
                'minute',                         // unit name
                [1]                            // allowed multiples
            ]];

        // data
        let frame = source;

        // the series visible by default
        let i_limit;
        if (frame.data.length <= 3) {
            i_limit = frame.data.length;
        } else {
            i_limit = frame.data.length - 3;
        }

        // the series
        for (let i = 0; i < frame.data.length; i += 1) {

            sectors.push({
                name: frame['periods'][i].substring(0, 4),
                data: frame.data[i],
                lineWidth: 1,
                type: 'spline',
                dataGrouping: {
                    enabled: true,
                    units: groupingUnits,
                    dateTimeLabelFormats: {
                        millisecond: ['%A, %e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                        second: ['%A, %e %b, %H:%M:%S', '-%H:%M:%S'],
                        minute: ['%A, %e %b, %H:%M', '-%H:%M'],
                        hour: ['%A, %e %b, %H:%M', '-%H:%M'],
                        day: ['%A, %e %b', '-%A, %e %b'],
                        week: ['Week from %A, %e %b', '-%A, %e %b'],
                        month: ['%B', '-%B']
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {series.name} </b>: ' +
                        '{point.y:,.3f}m<br/>'
                },
                visible: i > i_limit

            });

        }

        // Formatting
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });



        // Draw a graph
        Highcharts.stockChart('container0005', {

            rangeSelector: {
                selected: 5,
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
                inputEnabled: false,
                inputDateFormat: '%Y-%m-%d'
            },

            chart: {
                type: 'spline',
                zoomType: 'xy',
                width: 465,
                height: 485
            },

            title: {
                text: optionSelected
            },

            subtitle: {
                text: 'Gauge River/Water Spot: ' + frame['river_name']
            },

            credits: {
                enabled: false
            },

            legend: {
                enabled: true,
                itemStyle: {
                    fontSize: '13px',
                    fontWeight: 400,
                    textOverflow: "ellipsis"
                },
            },

            navigator: {
                xAxis: {
                    labels: {
                        format: '{value: %b }'
                    }
                }
            },

            yAxis: {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'level (metres)',
                    x: 0
                },
                lineWidth: 2,
                resize: {
                    enabled: true
                },
                height: '85%',
                plotLines: [
                    {
                        value: attributes['e_u_whisker'],
                        color: '#000000',
                        width: 0.85,
                        label: {
                            useHTML: true,
                            style: {
                                color: '#000000'
                            },
                            text: '95<sup>th</sup> plc.<br>' + attributes['e_u_whisker'] + 'm'
                        }
                    }
                ]
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    millisecond:"%e %b %H:%M:%S.%L",
                    second:"%e %b<br>%H:%M:%S",
                    minute:"%e %b<br>%H:%M",
                    hour:"%e %b<br>%H:%M",
                    day:"%e %b<br>%Y",
                    week:"%e %b<br>%Y",
                    month:"%b %Y",
                    year:"%Y"
                },
                labels: {
                    format: '{value:%e %b }'
                },
                title: {

                }
            },

            caption: {
                text: '<p>Each spline represents a gauge\'s river level measures ' +
                    'during a single year.</p>'
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

            tooltip: {
                split: true
            },

            plotOptions: {
                series: {
                    pointStart: frame['starting'],
                    pointInterval: frame['interval'],
                    turboThreshold: 8000
                }
            },

            series: sectors

        });


    }).fail(function() {
        console.log("Missing");
        $('#container0005').empty();
    });



}