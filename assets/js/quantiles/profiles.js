// noinspection DuplicatedCode

var Highcharts;
var optionSelected;
var dropdown = $('#option_selector');
var url = '/warehouse/quantiles/menu/menu.json';


// Dropdown: Launch
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


// Dropdown: Select
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

    $.getJSON('/warehouse/quantiles/aggregates/aggregates.json', function (source) {

        // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
        // https://api.highcharts.com/class-reference/Highcharts.Point#.name
        // https://api.highcharts.com/highstock/tooltip.pointFormat


        // The categories
        let data = source[fileNameKey];


        // split the data set into ...
        let training = [],
            q_training = [];


        training.push({
            x: 0,
            y: data['e_l_whisker'],
            description: '5 percentile boundary'
        });

        training.push({
            x: 0,
            y: data['minimum'],
            description: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data['t_minimum'])
        });

        training.push({
            x: 0,
            y: data['maximum'],
            description: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data['t_maximum'])

        });

        training.push({
            x: 0,
            y: data['e_u_whisker'],
            description: '95 percentile boundary'

        });


        q_training = [{
            x: 0,
            low: data['l_whisker'],
            q1: data['l_quartile'],
            median: data['median'],
            q3: data['u_quartile'],
            high: data['u_whisker']
        }];


        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });


        // Draw a graph
        Highcharts.chart('container0002', {

            chart: {

                zoomType: 'xy',
                inverted: true,
                height: 365,
                width: 495
            },

            title: {
                text: optionSelected
            },

            subtitle: {
                text: '<p>Measurements Profile, Across Time</p> <br/><br/>'
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
                }
            },

            caption: {
                useHTML: true,
                style: {
                    fontSize: '0.95em'
                },
                text: '<br>' + data['station_name'] + '<br>' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data['p_starting']) + ' &Rarr; ' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data['p_ending'])
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
                title: {
                    text: 'QUANTILES, ETC.'
                }
            },

            yAxis: {
                title: {
                    text: 'metres'
                }
            },

            plotOptions: {
                series: {
                    turboThreshold: 8000
                },
                scatter: {
                    jitter: {
                        x: 0.1,
                        y: 0
                    },
                    marker: {
                        radius: 2,
                        symbol: 'circle'
                    },
                    tooltip: {
                        pointFormat: 'value: {point.y:.3f}m<br/>{point.description}'
                    }
                },
                boxplot: {
                    tooltip: {
                        useHTML: true,
                        headerFormat: '<span style="color:{point.color}">\u25CF</span> <em>Quantiles: {point.key}</em><br/>',
                        pointFormat: '' +
                            'Lower Whisker $10^{th}$: {point.low:,.3f}m<br/>' +
                            'Lower Quartile: {point.q1:,.3f}m<br/>' +
                            'Median: {point.median:,.3f}m<br/>' +
                            'Upper Quartile: {point.q3:,.3f}m<br>' +
                            'Upper Whisker $90^{th}$: {point.high:,.3f}m<br/>'
                    },
                    whiskerWidth: 3,
                    medianWidth: 1,
                    pointWidth: 6,
                    medianColor: '#000000',
                    stemColor: '#000000',
                    whiskerColor: '#000000'
                }
            },


            series: [
                {
                    type: 'scatter',
                    name: '<b>POINT OF NOTE</b>',
                    data: training,
                    color: 'black'
                }, {
                    type: 'boxplot',
                    name: '<b>QUANTILES</b>',
                    data: q_training,
                    color: 'olive',
                    fillColor: 'olive'
                }
            ]
        });

    }).fail(function () {
        console.log("Missing");
        $('#container0002').empty();
    });

}
