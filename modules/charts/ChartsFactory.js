var charts = charts || {
    models: {},
    views: {}
};

charts.ChartsFactory = function(){

    return {

        availableCharts: {
            'd3':{
                'linechart': {
                    'Class': charts.views.C3LineChart,
                    'attributes': []
                },
                'areachart': {
                    'Class': charts.views.C3AreaChart,
                    'attributes': []
                },
                'barchart': {
                    'Class': charts.views.C3BarChart,
                    'attributes': []
                },
                'columnchart': {
                    'Class': charts.views.C3ColumnChart,
                    'attributes': []
                },
                'piechart': {
                    'Class': charts.views.C3PieChart,
                    'attributes': []
                },
                'donutchart': {
                    'Class': charts.views.C3DonutChart,
                    'attributes': []
                },
                'tornadochart': {
                    'Class': charts.views.C3TornadoChart,
                    'attributes': []
                },                  
            },
            'google':{
                'linechart': {
                    'Class': charts.views.GoogleLineChart,
                    'attributes': []
                },
                'areachart': {
                    'Class': charts.views.GoogleAreaChart,
                    'attributes': []
                },
                'barchart': {
                    'Class': charts.views.GoogleBarChart,
                    'attributes': []
                },
                'columnchart': {
                    'Class': charts.views.GoogleColumnChart,
                    'attributes': []
                },
                'piechart': {
                    'Class': charts.views.GooglePieChart,
                    'attributes': []
                },              
                'donutchart': {
                    'Class': charts.views.GoogleDonutChart,
                    'attributes': []
                },
                'geochart': {
                    'Class': charts.views.GoogleGeoChart,
                    'attributes': []
                },
                'tornadochart': {
                    'Class': charts.views.GoogleTornadoChart,
                    'attributes': []
                },
                'treemapchart': {
                    'Class': charts.views.GoogleTreemapChart,
                    'attributes': []
                }
            },
            'am':{
                'linechart': {
                    'Class': charts.views.AmLineChart,
                    'attributes': []
                },
                'areachart': {
                    'Class': charts.views.AmAreaChart,
                    'attributes': []
                },
            },
            'leaflet':{
                'mapchart': {
                    'Class': charts.views.LeafletMapChart,
                    'attributes': []
                },
            }
        },
    
        create: function(type,lib){
            type = type || 'linechart';
            lib = lib || 'google';

            // If google map
            if( type == 'mapchart' && lib == 'google'){
                // Antes teniamos google maps como una opción. Desde ahora siempre será leaflet para mapchart, por mas que esté seteado como google maps.
                lib = 'leaflet';
            }

            if( _.has(this.availableCharts,lib) &&
                _.has(this.availableCharts[lib],type) ){
                return this.availableCharts[lib][type];
            } else {
                return false;
            }
        }
    }
};