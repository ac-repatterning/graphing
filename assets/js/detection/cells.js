// noinspection ES6ConvertVarToLetConst,JSUnresolvedReference

var Highcharts;

// Generate graph
$.getJSON('/warehouse/detection/initial/perspective/perspective.json', function (source) {

    // https://api.highcharts.com/highstock/plotOptions.series.dataLabels
    // https://api.highcharts.com/class-reference/Highcharts.Point#.name
    // https://api.highcharts.com/highstock/tooltip.pointFormat


    // The fields
    const columns = {
        station: [],
        p_anomaly: [],
        gap: [],
        missing: [],
        asymptote: [],
        extreme: [],
        catchment: []
    };

    let indices = source['columns'];
    let i_p_anomaly = indices.indexOf('p_anomaly'),
        i_gap = indices.indexOf('gap'),
        i_asymptote = indices.indexOf('asymptote'),
        i_extreme = indices.indexOf('extreme'),
        i_missing = indices.indexOf('missing'),
        i_station = indices.indexOf('station_name'),
        i_catchment = indices.indexOf('catchment_name'),
        i_starting = indices.indexOf('p_starting');


    // Data
    for (let i = 0; i < source['data'].length; i += 1) {

        let name = source['data'][i][i_station],
            beginning = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', source['data'][i][i_starting]);

        // Street Images
        let expression = `<abbr title='period beginning ${beginning}'>${name}</abbr>`;
        columns.station.push(expression);

        // ... and
        columns.p_anomaly.push(source['data'][i][i_p_anomaly]);
        columns.gap.push(source['data'][i][i_gap]);
        columns.missing.push(source['data'][i][i_missing]);
        columns.asymptote.push(source['data'][i][i_asymptote]);
        columns.extreme.push(source['data'][i][i_extreme]);
        columns.catchment.push(source['data'][i][i_catchment]);

        // columns.starting.push( Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', source['data'][i][i_starting]) );
    }


    // Grid
    Grid.grid('container0003', {

        dataTable: {
            columns: columns
        },

        lang: {
            pagination: {
                pageInfo: `{start} - {end} of {total}
            (page {currentPage} of {totalPages})`,
                rowsPerPage: 'rows per page'
            }
        },

        credits: {
            enabled: false
        },

        rendering: {
            rows: {
                minVisibleRows: 10
            }
        },

        pagination: {
            enabled: true,
            pageSize: 10,
            controls: {
                pageSizeSelector: {
                    enabled: true,
                    options: [10, 20, 50]
                },
                pageInfo: true,
                firstLastButtons: true,
                previousNextButtons: true,
                pageButtons: {
                    enabled: true,
                    count: 7
                }
            }
        },

        // https://api.highcharts.com/grid/#interfaces/Grid_Core_Options.Options#columndefaults
        columnDefaults: {
            sorting: {
                sortable: true
            }
        },

        // https://api.highcharts.com/grid/#interfaces/Grid_Core_Options.Options#columns
        columns: [{
            id: 'asymptote',
            width: 145,
            header: {
                format: '<b><abbr title="A distinct flat line is 4 or more consecutive & equal river level values.  Each field value denotes the number of time points that the flat lines of a gauge series span.">FLAT LINES<br></abbr></b><br>'
            },
            sorting: {
                enabled: true,
                order: 'desc'
            }
        }, {
            id: 'gap',
            width: 125,
            header: {
                format: '<b><abbr title="A distinct gap is 4 or more consecutive missing river level values.  Each field value denotes the number of time points that the gaps of a gauge series span.">GAPS<br></abbr></b><br>'
            },
            sorting: {
                enabled: true
            }
        }, {
            id: 'missing',
            width: 135,
            header: {
                format: '<b><abbr title="If measurement is not recorded at a time point, we have a missing value.  Each field value denotes the number missing measurements per gauge series, and relative to the starting time point.">MISSING<br></abbr></b><br>'
            },
            sorting: {
                enabled: true
            }
        }, {
            id: 'p_anomaly',
            width: 125,
            header: {
                format: '<b><abbr title="Due to the difference between the expected value, vis-à-vis model, and the real value; missing value points are skipped.">PLAUSIBLE<br>ANOMALIES</abbr></b>'
            },
            sorting: {
                enabled: true
            }
        }, {
            id: 'extreme',
            width: 135,
            header: {
                format: '<b><abbr title="The # of points below the 5 percentile, or above the 95 percentile, of river level values across time.">THRESHOLDS<br></abbr></b><br>'
            },
            sorting: {
                enabled: true
            }
        }, {
            id: 'catchment',
            width: 205,
            header: {
                format: '<b><abbr title="The catchment area within which the gauge station lies.">Catchment<br></abbr><br></b>'
            },
            filtering: {
                enabled: true,
                inline: false,
                condition: 'contains'
            }
        }, {
            id: 'station',
            width: 165,
            header: {
                format: '<b>Station</b>'
            },
            filtering: {
                enabled: true,
                inline: false,
                condition: 'contains'
            }
        }
        ]

    });

});


