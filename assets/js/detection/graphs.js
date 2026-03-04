// noinspection DuplicatedCode,ES6ConvertVarToLetConst

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/detection/live/menu/menu.json';


function __sequence(elements, field) {

    let data = [];

    let names = elements['columns'];
    let i_timestamp = names.indexOf('timestamp'),
        i_field = names.indexOf(field);

    for (let i = 0; i < elements['data'].length; i += 1) {

        data.push({
            x: elements.data[i][i_timestamp], // the date
            y: elements.data[i][i_field] // a field
        });

    }

    return data;

}


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
    $.getJSON('/warehouse/detection/live/points/' + fileNameKey + '.json', function (source) {

        // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
        // https://api.highcharts.com/class-reference/Highcharts.Point#.name
        // https://api.highcharts.com/highstock/tooltip.pointFormat


        // split the data set into ohlc and medians
        let groupingUnits = [[
                'minute',   // unit name
                [1]      // allowed multiples
            ]];

        let original = __sequence(source['estimates'], 'original'),
            plausible = __sequence(source['p_anomalies'], 'original'),
            gaps = __sequence(source['gaps'], 'gap'),
            missing = __sequence(source['missing'], 'missing'),
            asymptotes = __sequence(source['asymptotes'], 'asymptote');


        // Draw a graph
        Highcharts.stockChart('container0033', {

            lang: {
                thousandsSep: ','
            },

            rangeSelector: {
                selected: 1,
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
                width: 485,
                height: 635
            },

            legend: {
                enabled: true
            },

            title: {
                text: source['station_name']
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
                    day: "%A, %e %B<br>%Y",
                    week: "%A, %e %b<br>%Y",
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
                    text: 'series,<br>etc.',
                    x: 0
                },
                height: '43.5%',
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
                            text: '$95^{th}$ pcl. ' + attributes['e_u_whisker'] + 'm'
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
                            text: '$5^{th}$ pcl. ' + attributes['e_l_whisker'] + 'm'
                        }
                    }
                ]
            }, {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'asymptotes:<br>flat lines',
                    x: 0
                },
                top: '49%',
                height: '23.5%',
                offset: 0,
                lineWidth: 2,
                min: 3
            }, {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'gaps<br>& missing',
                    x: 0
                },
                top: '78.0%',
                height: '19.5%',
                offset: 0,
                lineWidth: 2,
                min: 3
            }
            ],

            plotOptions: {
                series: {
                    turboThreshold: 4000
                }
            },

            tooltip: {
                split: true,
                shared: true,
                dateTimeLabelFormats: {
                    millisecond: ['%A, %e %b, %H:%M:%S.%L', '%e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                    second: ['%A, %e %b, %H:%M:%S', '%e %b, %H:%M:%S', '-%H:%M:%S'],
                    minute: ['%A, %e %b, %H:%M', '%e %b, %H:%M', '-%H:%M'],
                    hour: ['%A, %e %b, %H:%M', '%e %b, %H:%M', '-%H:%M'],
                    day: ['%A, %e %b', '%e %b, %Y', '-%A, %b %e, %Y'],
                    week: ['Week from %A, %e %b, %Y', '%A, %e %b', '-%A, %e %b, %Y'],
                    month: ['%B %Y', '%B', '-%B %Y'],
                    year: ['%Y', '%Y', '-%Y']
                }

            },

            series: [
                {
                    name: 'original',
                    data: original,
                    color: '#554d4d',
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 1.35
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    yAxis: 0,
                    dataGrouping: {
                        enabled: true,
                        units: groupingUnits,
                        dateTimeLabelFormats: {
                            millisecond: ['%A, %e %b, %H:%M:%S.%L', '%e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                            second: ['%A, %e %b, %H:%M:%S', '%e %b, %H:%M:%S', '-%H:%M:%S'],
                            minute: ['%A, %e %b, %H:%M', '%e %b, %H:%M', '-%H:%M'],
                            hour: ['%A, %e %b, %H:%M', '%e %b, %H:%M', '-%H:%M'],
                            day: ['%A, %e %b', '%e %b, %Y', '-%A, %e %b, %Y'],
                            week: ['Week from %A, %e %b, %Y', '%A, %e %b', '-%A, %e %b, %Y'],
                            month: ['%B %Y', '%B', '-%B %Y'],
                            year: ['%Y', '%Y', '-%Y']
                        }
                    },
                    tooltip: {
                        pointFormat: 'Sensor measure: {point.y:,.3f}m<br/>'
                    }
                },
                {
                    name: 'asymptotes: flat lines',
                    data: asymptotes,
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 1.85
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    color: '#598F24',
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: '# of equal consecutive points: {point.y}<br/>'
                    }
                },
                {
                    name: 'gaps',
                    data: gaps,
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 1.85
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    color: '#EE7600',
                    yAxis: 2,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: '# of consecutive missing points: {point.y}<br/>'
                    }
                },
                {
                    name: 'missing',
                    data: missing,
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 1.85
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    color: '#000000',
                    yAxis: 2,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: 'This time point does not<br>have a measurement.<br/>'
                    }
                },
                {
                    name: 'plausible anomalies',
                    data: plausible,
                    lineWidth: 0,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 2.25
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    color: '#780222',
                    yAxis: 0,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: 'An anomalous measure?<br>{point.y:,.3f}m<br/>'
                    }
                }
            ]
        });

    }).fail(function () {
        console.log("Missing");
        $('#container0033').empty();
    });

}
