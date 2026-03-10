// noinspection ES6ConvertVarToLetConst,DuplicatedCode

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/continuous/menu/menu.json';


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


    $.getJSON('/warehouse/continuous/points/' + fileNameKey + '.json', function (source)  {


        // split the data set into ...
        let groupingUnits = [[
            'minute',                         // unit name
            [1]                            // allowed multiples
        ]];


        // Formatting
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });


        // Draw a graph
        Highcharts.stockChart('container0007', {

            rangeSelector: {
                selected: 4,
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
                type: 'spline',
                zoomType: 'xy',
                width: 465,
                height: 485
            },

            title: {
                text: optionSelected
            },

            subtitle: {
                text: 'Gauge River/Water Spot: ' + source['river_name']
            },

            credits: {
                enabled: false
            },

            yAxis: [{
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
                            text: '95<sup>th</sup>  pcl.<br>' + attributes['e_u_whisker'] + 'm'
                        }
                    }
                ]
            }
            ],

            xAxis: {
                type: 'datetime',
                crosshair: {
                    enabled: true
                },
                dateTimeLabelFormats: {
                    millisecond:"%e %b %H:%M:%S.%L",
                    second:"%e %b<br>%H:%M:%S",
                    minute:"%e %b<br>%H:%M",
                    hour:"%e %b<br>%H:%M",
                    day:"%e %b<br>%Y",
                    week:"%e %b %Y",
                    month:"%b %Y",
                    year:"%Y"
                },
                title: {

                }
            },

            caption: {
                margin: 25,
                text: '<p><div style="font-size: 12px;">A gauge\'s river level measures;  metres.  Each graph point is an Ordnance Datum river level. An ' +
                    'ordance datum river level is the sum of (a) a river level relative to a gauge datum, and (b) the gauge ' +
                    'datum of the gauge site. SEPA publishes river levels relative to a gauge datum.metres.</div></p>'
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
                share: false,
                split: false,
                dateTimeLabelFormats: {
                    millisecond:"%A, %e %b, %H:%M:%S.%L",
                    second:"%A, %e %b, %H:%M:%S",
                    minute:"%A, %e %b, %H:%M",
                    hour:"%A, %e %b, %H:%M",
                    day:"%A, %e %b, %Y",
                    week:"%A, %e %b, %Y",
                    month:"%A, %e %b, %Y",
                    year:"%Y"
                }

            },

            series: [
                {
                    name: source['station_name'],
                    data: source.data,
                    color: 'brown',
                    lineWidth: 1,
                    type: 'spline',
                    turboThreshold: 4000,
                    dataGrouping: {
                        enabled: true,
                        units: groupingUnits,
                        dateTimeLabelFormats: {
                            millisecond: ['%A, %e %b, %H:%M:%S.%L', '-%H:%M:%S.%L'],
                            second: ['%A, %e %b, %H:%M:%S', '-%H:%M:%S'],
                            minute: ['%A, %e %b, %H:%M', '-%H:%M'],
                            hour: ['%A, %e %b, %H:%M', '-%H:%M'],
                            day: ['%A, %e %b, %Y', '-%A, %e %b, %Y'],
                            week: ['Week from %A, %e %b, %Y', '-%A, %e %b, %Y'],
                            month: ['%B %Y', '%B', '-%B %Y'],
                            year: ['%Y', '%Y', '-%Y']
                        }
                    },
                    tooltip: {
                        pointFormat: '<br/><span style="color:{series.color}">\u25CF</span> <b> {series.name} </b>: ' +
                            '{point.y:,.3f}m<br/>'
                    }
                }
            ]


        });


    }).fail(function() {
        console.log("Missing");
        $('#container0007').empty();
    });



}