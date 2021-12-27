var my_counter = 0;

var charts = charts || {
    models: {},
    views: {}
};

charts.models.ChartData = Backbone.Model.extend({
    type: 'line',
    idAttribute: 'visualization_revision_id',
    urlRoot: '/rest/charts/',
    hasData: false,
    defaults: {
        filters: {},
        type: 'line',
        fields: [
            // [fieldtype, fieldname]
        ],
        rows: [
            // [value, value, value, ...]
        ],
        //Map data
        features: [
            // "lat": "00.000000",
            // "long": "-00.000000",
            // "info": "<strong>Point text information</strong>"
        ],
        clusters: [
            // "lat": "00.000000",
            // "long": "-00.000000",
            // "info": "<strong>Point text information</strong>"
        ]
    },

    initialize: function () {

        // Dejo comentado esto, porque pide fetch cada vez que se hace click en un tipo de gráfico en la creacion de viz.
        // Reviso si hace problema en otro lado de la plataforma.
        // UPDATE: Era necesario para cargar un grafico. Lo que hice fue generar los fetch en las vistas que lo necesitaban, y listo.
        // UPDATE 2: Era necesario al mover el mapa (disparaba este evento);
        // this.on('change:filters', this.onFiltersChange, this);
    },

    /**
     * Se actualiza la data mediante el metodo fetch cada vez que se escucha un cambio en los filtros
     */
    onFiltersChange: function (model, filters) {
        var has_id = !_.isUndefined(this.get('id'));
        if (has_id || ('data' in filters && 'type' in filters && filters['data'] && filters['type'])) {
            this.fetch();
        }
    },

    /**
     * Se sobreescribe función fetch para detener cualquier request que esté pendiente
     * @return {[type]} [description]
     */
    fetch: function () {

        var self = this;
        this.trigger('fetch:start');

        if(this.fetchXhr && this.fetchXhr.readyState > 0 && this.fetchXhr.readyState < 4){
            this.fetchXhr.abort();
        }
        this.fetchXhr = Backbone.Model.prototype.fetch.apply(this, arguments);
        this.fetchXhr.then(function () {
            self.hasData = true;
            self.trigger('data_updated');
        });
        this.fetchXhr.always(function () {
            self.trigger('fetch:end');
        });
        return this.fetchXhr;
        
    },

    parse: function (response) {

        /**
         * Se crean e inicializan los elementos clusters y features.
         * Para el caso de que no vengan con la respuesta del motor v12
         */
        if(_.isUndefined(response.clusters)) response.clusters = [];
        if(_.isUndefined(response.features)) response.features = [];

        var response = response,
            filters = this.get('filters');

        // A veces no viene definido filters, si es asi le inicializo el type, que lo necesita esta funcion.
        if ( 
            _.isUndefined( filters ) || 
            _.isEmpty(filters) || 
            filters == ''

        ){

            filters = {
                type: this.get('type'),
            }
        }

        if (filters.type === 'mapchart' || filters.type === 'geochart') {
            
            return response;

        } else {

            // Si series no viene en la respuesta, o viene vacio, procedo a crearlo vacío.
            if( 
                _.isUndefined( response.series ) || 
                _.isEmpty(response.series) || 
                response.series == ''
            ){

                response.series = [];
                var values = [];

                // Si es piechart o donutchart, concateno los values y dejo 1 serie
                if( filters.type === 'piechart' || filters.type === 'donutchart' ){

                    // Creo 1 serie
                    response.series.push({
                        'name': ''
                    }); 

                    // genero showlegend false que desp usaré
                    response.showLegend = false;

                    // Concateno los values
                    var values = _.flatten(response.values);

                    // Si vienen labels
                    if(
                        !_.isUndefined( response.labels ) || 
                        !_.isEmpty(response.labels) || 
                        response.labels != ''
                    ){

                        // Si el length de los values concatenados es distinto al length de labels
                        if( values.length != response.labels.length ){

                            // Chequeo si el primer array de values es todo null, entonces lo descarto. 
                            // Es algo muy comun que surgió con la migración de datos
                            var check = false;

                            for( var i=0;i<response.values[0].length;i++ ){

                                if( _.isNull( response.values[0][i] ) ){
                                    check = true;
                                }

                            }

                            if( check ){
                                response.values.shift();
                                values = _.flatten(response.values);
                            }   

                        }
                        
                    }

                    response.values = [];
                    response.values.push(values);

                // Itero por el length de values y creo las series segun eso
                }else{

                    for(var i=0;i<response.values.length;i++){

                        // Solo uso los valores que no son vacios
                        if( response.values[i].length > 0 ){
                            response.series.push({
                                'name': ''
                            }); 
                            values.push( response.values[i] );
                        }

                    }

                    // genero showlegend false que desp usaré
                    response.showLegend = false;

                    response.values = values;

                }

            // Si el length de series == 1 y el length de values es > 1, concateno los values.
            }else if(
                response.series.length == 1 &&
                response.values.length > 1 
            ){

                var values = _.flatten(response.values);
                response.values = [];
                response.values.push(values);
            
            // Si values tiene un array vacio lo mando como null
            }else if( 
                response.series.length == response.values.length 
            ){

                var series = [],
                    values = [];

                for(var i=0;i<response.values.length;i++){
                    if( response.values[i].length == 0 ){ 
                        values.push( null );
                    }else{
                        values.push( response.values[i] );
                    }
                    series.push( response.series[i] );
                }

                response.series = series;
                response.values = values;                

            // Si hay mas de 1 serie, mas de 1 array de valores, y el length de series es distinto al length de values
            }else if(
                response.series.length > 1 &&
                response.values.length > 1 && 
                response.series.length != response.values.length 
            ){

                var count = 0,
                    values = [];

                // Por cada serie creo un array vacio en values
                for(var s=0;s<response.series.length;s++){
                    values.push([]);
                }

                for(var w=0;w<values.length;w++)
                {
                    // Itero por los valores de response.values ciclicamente
                    for(var i=0;i<response.values.length;i++){

                        // Uso count hasta que llegue a ser igual a la cantidad de series, ahi la reseteo a 0 y vuelvo a empezar (para hacerlo ciclico)
                        if( count == response.series.length ){
                            count = 0;
                        }                   

                        // Cada array de response.values puede tener N valores. Todos esos valores del array en cuestion pertenecen a la misma columna, por lo mismo los agrego en el mismo array.
                        if( response.values[i].length == 0 ){

                            values[count].push( null );                       

                        }else{
                        	
                            values[count].push( response.values[i][count] );
                            
                        }
                    }
                    count++;
                }


                // Asigno los nuevos values a response.values
                response.values = values;

            }

            // Si labels no viene en la respuesta, o viene vacio, procedo a crearlo vacío.
            if( 
                _.isUndefined( response.labels ) || 
                _.isEmpty(response.labels) || 
                response.labels == '' 
            ){

                for(var i=0;i<response.values[0].length;i++){
                    response.labels.push(''); 
                }

            }

            var labels = response.labels,
            columns = [],
            fields =[];

            //TODO: arreglar este hack para crear labels vacios
            if (labels && !labels.length) {
                labels = Array.apply(null, {length: response.values[0].length}).map(Number.call, Number);
                fields.push(['number', 'labels']);
            } else {
                //TODO: revisar el formato del lable
                fields.push(['string', 'labels']);
            }
            columns.push(labels);

            columns = columns.concat(response.values);
            fields = fields.concat(_.map(response.series, function (item) {
                return ['number', item.name];
            }));

            this.set('fields', fields);
            this.set('rows', _.clone(_.unzip(columns)));
            this.set('response', response);

        }
    },

    /**
     * Se arma la url para el fetch utilizando los attributos pasados al modelo y los filtros existentes
     */
    url: function () {
        var params = '';

        if( !_.isUndefined(this.get('parameters')) ){

            var parameters = this.get('parameters');

            for(var i=0;i<parameters.length;i++){
                params += '&pArgument'+parameters[i].position+'='+parameters[i].default;
            }

        }

        var filters = this.get('filters'),
            id = this.get('id'), // ID existe cuando la visualizacion está siendo editada
            url,
            endpoint = 'charts/';

        if (filters.type === 'mapchart' || filters.type === 'trace' ) {
            endpoint = 'maps/';
        }

        if (_.isUndefined(id)) {
            url = '/rest/' + endpoint + 'sample.json/' + '?' + $.param(filters) + params;
        } else {
            filters = _.omit(filters, 'data')
            filters = _.omit(filters, 'headers')
            filters = _.omit(filters, 'labels')
            filters = _.omit(filters, 'nullValueAction')
            filters = _.omit(filters, 'nullValuePreset')
            filters = _.omit(filters, 'type')
            filters = _.omit(filters, 'invertedAxis')
            filters = _.omit(filters, 'revision_id')
            url = '/rest/' + endpoint + id + '/data.json/' + '?' + $.param(filters) + params;
        }

        return url;
    }
});
