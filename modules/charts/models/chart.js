var charts = charts || {
    models: {},
    views: {}
};

charts.models.Chart = Backbone.Model.extend({
    urlRoot: '/api/charts/',
    defaults: {
        lib: 'google',
        showLegend: true,
        showScale: true,
        isStacked: false,
        showXAxis: true,
        showYAxis: true,
        explorer: false,
        geoMapColorMin: undefined,
        geoMapColorMiddle: undefined,
        geoMapColorMax: undefined,
        geoMapColorBackground: undefined,
        geoMapColorDataless: undefined,
        geoMapColorDefault: undefined,        
        geoMapDisplayValue: undefined,        
        geoMapDisplayOption: undefined,        
        geoMapDisplayType: undefined,    
        treemapColorMin: undefined,
        treemapColorMiddle: undefined,
        treemapColorMax: undefined,
        treemapColorFont: undefined,
        treemapColorHeader: undefined,    
        invertData: undefined,
        invertedAxis: undefined,
        chartTemplate: undefined,
        nullValueAction: 'exclude',
        nullValuePreset: undefined,

        //flag que indica si alguna vez abrió el modal de datos, es para validación
        select_data: false,

        //validation
        message: '',

        //metadata
        title: undefined,
        description: undefined,
        notes: undefined,
        datastream_category: undefined,
        datastream_sources: undefined,
        datastream_tags: undefined,
        parameters: undefined,

        //data selection
        range_headers: undefined,
        range_data: undefined,
        range_labels: undefined,

        // Map defaults
        joinIntersectedClusters: false,
        heatMap: undefined,
        onHeatMap: false,
        needToReloadData: false, //special case where I zoom on a heatMap
        mapType : 'ROADMAP',
        minCluster: undefined,
        styles: {},
        in_visualization_mapStyle : {},
        options: {
            zoom: 2,
            center: {
                lat: 0,
                long: 0
            },
            bounds: [85,180,-85,-180]
        },
        is_private: 'false'
    },
    initialize: function (options) {

        //Se inicializa acá para prevenir error en embed
        if(window.gettext){
            if( this.get('message') == ''){
                this.set('message', gettext("APP-CUSTOMIZE-VISUALIZATION-SELECT-DATA-TEXT"));
            }
        }

        if ( options && options.impl_details ){
            this.in_visualization_mapStyle = options.impl_details.mapStyle;
        }

        // A veces no tiene definido type. Si es asi, lo defino (resuelve problemas en mapas)
        if( _.isUndefined( this.get('type') ) ){

            if( !_.isUndefined(this.get('impl_details')) ){
                this.set('type', this.get('impl_details').format.type);
            }
        }

        this.data = new charts.models.ChartData({
            id: this.get('id'),
            type: this.get('type')
        });
        
        this.editMode = false;

        this.bindEvents();
    },

    bindEvents: function(){
        //Se actualizan los filtros de los datos cuando se cambian las options
        this.on('change', this.bindDataModel, this);
        this.listenTo(this.data, 'data_updated', this.handleDataUpdate);
    },

    parse: function (res) {

        if (res) {
            
            var data = {
                datastream_revision_id: res.datastream_revision_id,
                datastream_tags:  res.datastream_tags,
                datastream_sources: res.datastream_sources,
                datastream_category: res.datastream_category,
                parameters: res.parameters,
                mapStylesDefault: Configuration.mapStylesDefault,
                geomapStylesDefault: Configuration.geomapStylesDefault,
                treemapStylesDefault: Configuration.treemapStylesDefault,
            };

            this.editMode = res.editMode || false;

            // si hay una definición de estilos en el impl_details, usamos esa
            if (this.in_visualization_mapStyle )
                data.mapStylesDefault=this.in_visualization_mapStyle;


            _.extend(data, _.pick(res, [
                'revision_id',
                'lib'
                ]));


            //edit
            if (res.revision_id) {

                // If showXAxis is not defined, set default
                var showXAxis = this.get('showXAxis');
                if( !_.isUndefined( res.format.showXAxis ) ){
                    showXAxis = (res.format.showXAxis == 'checked')
                }
                // If showYAxis is not defined, set default
                var showYAxis = this.get('showYAxis');
                if( !_.isUndefined( res.format.showYAxis ) ){
                    showYAxis = (res.format.showYAxis == 'checked')
                }

                data = _.extend(data,{
                    type: res.format.type,

                    data: res.data,
                    
                    select_data:true,
                    notes: _.unescape(res.notes),
                    title: res.title,
                    description: res.description,

                    //config
                    showLegend: (res.format.showLegend == 'checked'),
                    isStacked: (res.format.isStacked == 'checked'),
                    chartTemplate: res.format.chartTemplate,
                    showXAxis: showXAxis,
                    showYAxis: showYAxis,
                    explorer: res.format.explorer,

                    invertData: (res.format.invertData == 'checked'),
                    invertedAxis: (res.format.invertedAxis == 'checked'),

                    nullValueAction: res.format.nullValueAction,
                    nullValuePreset: res.format.nullValuePreset,

                    geoMapColorMin: res.format.geoMapColorMin,
                    geoMapColorMiddle: res.format.geoMapColorMiddle,
                    geoMapColorMax: res.format.geoMapColorMax,
                    geoMapColorBackground: res.format.geoMapColorBackground,
                    geoMapColorDataless: res.format.geoMapColorDataless,
                    geoMapColorDefault: res.format.geoMapColorDefault,
                    geoMapDisplayValue: res.format.geoMapDisplayValue,
                    geoMapDisplayOption: res.format.geoMapDisplayOption,
                    geoMapDisplayType: res.format.geoMapDisplayType,

                    treemapColorMin: res.format.treemapColorMin,
                    treemapColorMiddle: res.format.treemapColorMiddle,
                    treemapColorMax: res.format.treemapColorMax,
                    treemapColorFont: res.format.treemapColorFont,
                    treemapColorHeader: res.format.treemapColorHeader,

                    showScale: (res.format.showScale == 'checked'),

                });
                if (data.type === 'mapchart') {
                    data = _.extend(data,{
                        mapType: res.chart.mapType? res.chart.mapType.toUpperCase(): undefined,
                        minCluster: res.chart.minCluster,
                        geoType: res.chart.geoType,
                        options:{
                            zoom: res.chart.zoom,
                            bounds: res.chart.bounds? res.chart.bounds.split(';'): undefined,
                            center: res.chart.center? {lat: res.chart.center[0], long: res.chart.center[1]}: undefined                    }
                    });
                };
            }

            //edit
            if (res.revision_id && this.editMode) {
                data = _.extend(data,{
                    headerSelection: res.chart.headerSelection,
                    labelSelection: res.chart.labelSelection,

                    latitudSelection: res.chart.latitudSelection,
                    longitudSelection: res.chart.longitudSelection

                });

                data.is_private = res.is_private;


                if (data.type === 'mapchart') {
                    data = _.extend(data,{
                        latitudSelection: res.chart.latitudSelection,
                        longitudSelection: res.chart.longitudSelection,
                        traceSelection: res.chart.traceSelection,
                        mapType: res.chart.mapType? res.chart.mapType.toUpperCase(): undefined,
                        minCluster: res.chart.minCluster,
                        geoType: res.chart.geoType,
                        options:{
                            zoom: res.chart.zoom,
                            bounds: res.chart.bounds? res.chart.bounds.split(';'): undefined,
                            center: res.chart.center? {lat: res.chart.center[0], long: res.chart.center[1]}: undefined
                        }
                    });
                };

                if (data.type === 'geochart') {
                    data = _.extend(data,{
                        //geoValues: res.chart.geoValues,
                        isoSelection: res.chart.isoSelection,
                        regionSelection: res.chart.regionSelection,
                    });
                }

            }
            var options = {
                silent: res.silent
            }

            this.set(data, options);
        }

    },

    bindDataModel: function () {

        var self = this,
            filters = {};


        if (!_.isUndefined(this.data.get('filters'))) {
            $.each(this.data.get('filters'), function(key, val) {
                filters[key] = val;
            });
        }

        if (this.get('type') === 'mapchart' || this.get('type') === 'trace') {
            $.extend(filters, this.getMapPreviewFilters());
        } else if (this.get('type') === 'geochart') {
            $.extend(filters, this.getGeoChartPreviewFilters());
        } else {
            $.extend(filters, this.getChartPreviewFilters());
        }

        // Set de visualization_parameters al data model
        if( !_.isUndefined( this.get('parameters') ) ){
            this.data.set( 'parameters', this.get('parameters') );
        }

        this.data.set('filters', filters);
    },

    getChartPreviewFilters: function () {

        var filters = {
            data: this.get('data'),
            headers: this.get('headerSelection'),
            labels: this.get('labelSelection'),
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset:  this.get('nullValuePreset') || '',
            type: this.get('type')
        };

        var revision_id = this.get('datastream_revision_id');
        if (!_.isUndefined(revision_id)) {
            filters['revision_id'] = revision_id
        }

        if(this.get('invertData')===true){
            filters['invertData'] = true;
        }

        if(this.get('invertedAxis')===true){
            filters['invertedAxis'] = true;
        }
        return filters;
    },

    getGeoChartPreviewFilters: function () {

        if(!this.isValid()){
            console.error('error en valid');
        }

        var filters = {
            data: this.get('data'),
            isoSelection: this.get('isoSelection'),
            regionSelection: this.get('regionSelection'),
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset:  this.get('nullValuePreset') || '',
            type: this.get('type')
        };

        var revision_id = this.get('datastream_revision_id');
        if (!_.isUndefined(revision_id)) {
            filters['revision_id'] = revision_id
        }

        return filters;
    },

    getMapPreviewFilters: function () {
        var id = this.get('id');

        var filters = {
                zoom: this.get('options').zoom,
                bounds: (this.get('options').bounds)? this.get('options').bounds.join(';'): this.getBoundsByCenterAndZoom(this.get('options').center, this.get('options').zoom),
                type: 'mapchart'
        };

        if(_.isUndefined(id)){

            filters = _.extend(filters,{
                nullValueAction: this.get('nullValueAction'),
                data: this.get('data'),
                lat: this.get('latitudSelection'),
                lon: this.get('longitudSelection'),
                traces: this.get('traceSelection'),
                headers: this.get('headerSelection'),
                minCluster: this.get('minCluster'),
            });
            if (this.get('minCluster')) {
                filters.mincluster = this.get('minCluster')
            }
            var revision_id = this.get('datastream_revision_id');
            if (!_.isUndefined(revision_id)) {
                filters['revision_id'] = revision_id
            }
        } else {
            filters['revision_id'] = id
        }


        if (this.has('nullValuePreset')) {
            filters.nullValuePreset = this.get('nullValuePreset');
        }
        return filters;
    },
    getBoundsByCenterAndZoom: function(center, zoom){
        var zf = Math.pow(2, zoom) * 2;

        // defino un ancho y un alto default porque no tengo acceso al elemento.
        var dw = 1000  / zf;
        var dh = 1000 / zf;
 
        var ne_lat = center.lat + dh; //NE lat
        var ne_lng = center.long + dw; //NE lng
        var sw_lat = center.lat - dh; //SW lat
        var sw_lng = center.long - dw; //SW lng

        return "" + ne_lat + ";" + ne_lng + ";" + sw_lat + ";" + sw_lng 
    },

    /**
     * Handler para manejar las actualizaciones a los datos
     * @return {[type]} [description]
     */
    handleDataUpdate: function () {
        this.trigger('data_updated');
    },

    valid: function(){
        var valid = true;

        //Si alguna vez intentó seleccionar algo de data
        if(this.get('select_data')){

            if (this.get('type') === 'mapchart') {

                // example validation
                // valid = (this.data.get('clusters').length >0);
                valid = true;
                //console.log('valid',valid);

            } else if (this.get('type') === 'piechart') {

                // TODO: agregar validacion 
                // tenemos piechart que traen 'series' con un valor y piecharts que no.
                valid = true;
                //console.log('valid',valid);

            } else if (this.get('type') === 'donutchart') {

                // TODO: agregar validacion 
                // tenemos donutchart que traen 'series' con un valor y piecharts que no.
                valid = true;
                //console.log('valid',valid);
            
            } else if (this.get('type') === 'geochart') {

                // TODO: agregar validacion 
                // tenemos piechart que traen 'series' con unv alor y piecharts que no.
                valid = true;
                //console.log('valid',valid);
            
            } else {

                //General validation
                var lFields = this.data.get('fields').length;

                var check = _.reduce(this.data.get('rows'),
                    function(memo, ar){
                     return (ar.length==lFields)?memo:memo + 1;
                    }, 0);

                if (check!=0){
                    this.set("message",gettext("APP-CUSTOMIZE-VISUALIZATION-VALIDATE-HEADLINES")); //reemplazar por locale
                    valid = false;
                }

                if(valid){
                    //TODO specific validation for chart type
                    switch(this.get('type')){
                        case 'piechart':
                            //console.log('is pie chart');
                            //validar que no haya números negativos en la primer serie que se usa para el pie
                        break;
                        case 'donutchart':
                            //console.log('is donut chart');
                            //validar que no haya números negativos en la primer serie que se usa para el pie
                        break;
                    }
                }

            }



        }

        return valid;
    },

    validateMetadata: function(){
        var validTitle = !_.isEmpty(this.get('title')),
            validDescription = !_.isEmpty(this.get('description'));
            //validNotes = this.get('notes').length < 2048;

        return {
                //valid: (  validTitle &&  validDescription && validNotes ),
                valid: (  validTitle &&  validDescription ),
                fields:{
                    'title':  !validTitle,
                    'description':  !validDescription,
                    //'notes': !validNotes
                }
            };
    },

    paramsToURLString: function(parameters){
        var result = [];
        _.each(parameters, function(parameter){
            result.push('pArgument' + parameter.position + '=' + parameter.default);
        });
        return result.join('&');
    },

    getSettings: function(){

        var settings = {
            title: this.get('title'),
            description: this.get('description'),
            notes: this.get('notes'),

            parameters: this.paramsToURLString(this.get('parameters')),

            type: this.get('type'),
            lib: this.get('lib'),
            showLegend: this.get('showLegend'),
            isStacked: this.get('isStacked'),
            showXAxis: this.get('showXAxis'),
            showYAxis: this.get('showYAxis'),
            explorer: this.get('explorer'),

            geoMapColorMin: this.get('geoMapColorMin'),
            geoMapColorMiddle: this.get('geoMapColorMiddle'),
            geoMapColorMax: this.get('geoMapColorMax'),
            geoMapColorBackground: this.get('geoMapColorBackground'),
            geoMapColorDataless: this.get('geoMapColorDataless'),
            geoMapColorDefault: this.get('geoMapColorDefault'),
            geoMapDisplayValue: this.get('geoMapDisplayValue'),
            geoMapDisplayOption: this.get('geoMapDisplayOption'),
            geoMapDisplayType: this.get('geoMapDisplayType'),

            treemapColorMin: this.get('treemapColorMin'),
            treemapColorMiddle: this.get('treemapColorMiddle'),
            treemapColorMax: this.get('treemapColorMax'),
            treemapColorFont: this.get('treemapColorFont'),
            treemapColorHeader: this.get('treemapColorHeader'),

            showScale: this.get('showScale'),

            chartTemplate: 'basicchart', // Muchachos, mando una para probar pero no se el criterio y es viernes por la noche. Las opciones son basicchart, piechart, mapchart, geochart
            nullValueAction: this.get('nullValueAction'),
            nullValuePreset: this.get('nullValuePreset'),
            invertData: this.get('invertData'),
            invertedAxis: this.get('invertedAxis'),

            //data selection
            headerSelection: this.get('headerSelection'),
            data: this.get('data'),
            labelSelection: this.get('labelSelection')
        };
        settings.is_private = (this.get('is_private') == 'true') ? 't' : '';

        if (this.get('type') === 'mapchart') {
            settings = _.extend( settings, {
                latitudSelection: this.get('latitudSelection'),
                longitudSelection: this.get('longitudSelection'),
                traceSelection: this.get('traceSelection'),
                mapType: this.get('mapType').toLowerCase(),
                minCluster: this.get('minCluster'),
                geoType: this.get('geoType'),
                zoom: this.get('options').zoom,
                bounds: this.get('options').bounds.join(';')
            });
        };

        if (this.get('type') === 'geochart') {
            settings = _.extend( settings, {
                //geoValues: this.get('geoValues'),
                isoSelection: this.get('isoSelection'),
                regionSelection: this.get('regionSelection'),
            });
        }   

        settings = _.extend( settings,this.getChartAttributes() );

        return settings;
    },

    getChartAttributes: function(){
        var attr = {};
        var that = this;
        _.each(this.get('attributes'),function(e){
            attr[e] = that.get(e);
        });
        return attr;
    },

    validate: function (attrs, options) {
        var nullValuePreset = attrs.nullValuePreset;

        if (!_.isUndefined(attrs.nullValueAction) && attrs.nullValueAction === 'given') {

            if (!_.isUndefined(nullValuePreset) && isNaN(nullValuePreset)) {
                return 'invalid-value';
            }

        }

        if (!_.isUndefined(attrs.minCluster) && attrs.minCluster != null) {

            if (!parseInt(attrs.minCluster)) {
                return 'invalid-value';
            }

        }
    },

    save: function (attrs, options) {
        var data = this.getSettings();

        return $.ajax({
            type:'POST',
            data: data,
            dataType: 'json'
        }).then(function (response) {
            if(response.status=='ok'){
                //console.log(response);
                return response;
            } else {
                console.error(response);
            }
        });
    },

    checkLegend: function(){
        var legend = this.get('showLegend');

        // Checkeo que no haya series vacia. Si las hay genere una propiedad showLegend = false en el response.
        if( this.get('type') !== 'mapchart' ){

            if( !_.isUndefined( this.data.get('response') ) ){

                var response = this.data.get('response');
                var showLegend = response.showLegend;

                if( !_.isUndefined( showLegend ) ){
                    legend = showLegend;
                }

            }
            
        }        

        return legend;
    }
});
