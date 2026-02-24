var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/caution/menu/menu.json';


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

    $.getJSON('/warehouse/caution/series/' + fileNameKey + '.json', function (source)  {

        // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
        // https://api.highcharts.com/class-reference/Highcharts.Point#.name
        // https://api.highcharts.com/highstock/tooltip.pointFormat


        // split the data set into ...
        let curve = [],
            groupingUnits = [[
                'minute',                         // unit name
                [1]                            // allowed multiples
            ]];

        let indices = source['columns'];
        let i_timestamp = indices.indexOf('timestamp'),
            i_approximation = indices.indexOf('approximation');

        for (var i = 0; i < source.data.length; i += 1) {

            curve.push({
                x: source.data[i][i_timestamp], // date
                y: source.data[i][i_approximation] // approximation
            });

        }


        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });


        // Draw a graph
        Highcharts.stockChart('container0002', {

            rangeSelector: {
                selected: 2,
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
                width: 495,
                height: 420
            },

            title: {
                text: 'Spot: ' + optionSelected
            },

            subtitle: {
                text: '<p>Curves</p> <br/><br/>'
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

            yAxis: {
                labels: {
                    align: 'left',
                    x: 9
                },
                title: {
                    useHTML: true,
                    text: 'rates of change<br>mm/hr',
                    x: 0
                },
                height: '85%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }
            ,

            plotOptions:{
                series: {
                    turboThreshold: 4000
                }
            },

            tooltip: {
                split: true,
                dateTimeLabelFormats: {
                    millisecond:"%A, %e %b, %H:%M:%S.%L",
                    second:"%A, %e %b, %H:%M:%S",
                    minute:"%A, %e %b, %H:%M",
                    hour:"%A, %e %b, %H:%M",
                    day:"%A, %e %B, %Y",
                    week:"%A, %e %b, %Y",
                    month:"%B %Y",
                    year:"%Y"
                }

            },

            series: [{
                type: 'spline',
                name: 'Curves',
                data: curve,
                color: '#6B8E23',
                dataGrouping: {
                    units: groupingUnits
                },
                tooltip: {
                    pointFormat: '{point.y:,.3f} mm/hr<br/>'
                }
            }]
        });

    });

}

