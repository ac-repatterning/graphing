// noinspection DuplicatedCode,ES6ConvertVarToLetConst

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/detection/initial/menu/menu.json';


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

    // Relative to Amazon S3 (Simple Storage Service) Set Up
    $.getJSON('/warehouse/detection/initial/points/' + fileNameKey + '.json', function (source) {

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
            asymptotes = __sequence(source['asymptotes'], 'asymptote'),
            extremes = __sequence(source['extremes'], 'original');


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
                width: 465,
                height: 585
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
                dateTimeLabelFormats: {
                    day: "%A, %e %B, %Y",
                    week: "%A, %e %b, %Y",
                    month: "%B %Y",
                    year: "%Y"
                },
                labels: {
                    format: '{value:%e %b, %Y }'
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
                height: '45%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    text: 'asymptotes:<br>flat lines',
                    x: 0
                },
                top: '47%',
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
                top: '72.5%',
                height: '23.5%',
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
                    millisecond: ['%A, %e %b, %H:%M:%S.%L', '%A, %e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                    second: ['%A, %e %b, %H:%M:%S', '%A, %e %b, %H:%M:%S', '-%H:%M:%S'],
                    minute: ['%A, %e %b, %H:%M', '%A, %e %b, %H:%M', '-%H:%M'],
                    hour: ['%A, %e %b, %H:%M', '%A, %e %b, %H:%M', '-%H:%M'],
                    day: ['%A, %e %b, %Y', '%A, %e %b', '-%A, %e %b, %Y'],
                    week: ['Week from %A, %e %b, %Y', '%A, %e %b', '-%A, %e %b, %Y'],
                    month: ['%B %Y', '%B', '-%B %Y'],
                    year: ['%Y', '%Y', '-%Y']
                }

            },

            series: [
                {
                    name: 'original',
                    data: original,
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
                    yAxis: 0,
                    dataGrouping: {
                        enabled: true,
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: '{point.y:,.3f}m<br/>'
                    }
                },
                {
                    name: 'asymptotes',
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
                        pointFormat: '{point.y:,.3f}m<br/>'
                    }
                },
                {
                    name: '< 5% | > 95%',
                    data: extremes,
                    visible: false,
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
                    color: '#A08E23',
                    yAxis: 0,
                    dataGrouping: {
                        units: groupingUnits
                    },
                    tooltip: {
                        pointFormat: '< <i>5pcl.</i> | > <i>95pcl.</i> threshold of this gauge.<br>{point.y:,.3f}m<br>'
                    }
                }
            ]
        });

    }).fail(function () {
        console.log("Missing");
        $('#container0033').empty();
    });

}
