var charts = charts || {
	models: {},
	views: {}
};

charts.views.GoogleLineChart = charts.views.LineChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	/***** DEJO COMENTADO PORQUE EL ZOOM EN GOOGLE CHARTS REQUIERE IMPLEMENTACION DE FORMATOS EN EL EJE YA SEA DE FECHA O NUMERO. *****/

	// isNumeric: function(a) {
	// 	if ($.isArray(a)) return false;
	// 	var b = a && a.toString();
	// 	a = a + "";
	// 	return b - parseFloat(b) + 1 >= 0 &&
	// 					!/^\s+|\s+$/g.test(a) &&
	// 					!isNaN(a) && !isNaN(parseFloat(a));
	// },

	// formatData: function (data) {
	// 	var dataTable = new google.visualization.DataTable();
	// 	if (data.fields.length === 0) {
	// 		return;
	// 	}

	// 	var newRows = data.rows;
	// 	var columnType = 'string';

	// 	if( !_.isUndefined( this.model.get('explorer') ) ){
	// 		if( !_.isNull( this.model.get('explorer') ) ){
		
	// 			var valueToCheck = data.rows[0][0];

	// 			// If is Date
	// 			if( moment(valueToCheck).isValid() ){
	// 				newRows = [];
	// 				columnType = 'date';
	// 				_.each(data.rows, function (field, index) {
	// 					newRows.push([moment(field[0], 'DD-MMM-YY').toDate(), field[1]]);
	// 				});

	// 			// If is Number
	// 			}else if( this.isNumeric(valueToCheck) ){
	// 				newRows = [];
	// 				columnType = 'number';
	// 				_.each(data.rows, function (field, index) {
	// 					newRows.push( [Number(field[0]), field[1]]);
	// 				});
	// 			}

	// 		}
	// 	}
		
	// 	console.log('newRows',newRows);
	// 	console.log('data.rows',data.rows);

	// 	_.each(data.fields, function (field, index){

	// 		console.log(index);

	// 		if( index == 0){
	// 			dataTable.addColumn(columnType, field[1]);
	// 		}else{
	// 			dataTable.addColumn(field[0], field[1]);
	// 		}
	// 	});

	// 	dataTable.addRows(newRows);

	// 	console.log('dataTable', dataTable);

	// 	return dataTable;
	// },

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}
		_.each(data.fields, function (field) {
			dataTable.addColumn(field[0], field[1]);
		});
		dataTable.addRows(data.rows);
		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());
		if (_.isUndefined(dataTable)) {
			return;
		}
		var options = (this.model.get('options') || {});

		/***** DEJO COMENTADO PORQUE EL ZOOM EN GOOGLE CHARTS REQUIERE IMPLEMENTACION DE FORMATOS EN EL EJE YA SEA DE FECHA O NUMERO. *****/

		// // Zoom Configuration
		// if( !_.isUndefined( this.model.get('explorer') ) ){
		// 	if( !_.isNull( this.model.get('explorer') ) ){

		// 		var zoomType;

		// 		switch( this.model.get('explorer') ){

		// 			// Zoom type drag
		// 			case 'drag':
		// 				zoomType = ['dragToZoom','rightClickToReset'];
		// 				break;

		// 			// Zoom type scroll
		// 			case 'scroll':		
		// 				zoomType = ['dragToPan'];
		// 				break;

		// 		}

		// 		// Zoom Options
		// 		zoomOptions = {
		// 			actions: zoomType,
		// 			//maxZoomIn: 0.25,
		// 			//maxZoomOut: 4,
		// 			//zoomDelta: 1.5,
		// 			keepInBounds: true,
		// 			axis: 'horizontal'
		// 		};

		// 		// Set zoom to chart options configuration
		// 		options.explorer = zoomOptions;

		// 	}
		// }

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Show X Axis
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			
			// Check if Options has configs for hAxis
			if( _.isUndefined( options.hAxis ) ){

				// Check if is object
				if( !_.isObject( options.hAxis ) ){
					options.hAxis = {}
				}

			}

			// No mostrar eje X si esta indicado como false
			if( !this.model.get('showXAxis') ){
				options.hAxis.baselineColor = 'none';
				options.hAxis.gridlineColor = 'none';
				options.hAxis.textPosition = 'none';
				options.hAxis.ticks = [];
			}

		}

		// Show Y Axis
		if( !_.isUndefined( this.model.get('showYAxis') ) ){

			// Check if Options has configs for vAxis
			if( _.isUndefined( options.vAxis ) ){

				// Check if is object
				if( !_.isObject( options.vAxis ) ){
					options.vAxis = {}
				}

			}
		
			// No mostrar eje Y si esta indicado como false
			if( !this.model.get('showYAxis') ){
				options.vAxis.baselineColor = 'none';
				options.vAxis.gridlineColor = 'none';
				options.vAxis.textPosition = 'none';
				options.vAxis.ticks = [];
			}

		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('line',options);

		this.chart = new google.visualization.LineChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}
});

charts.views.GoogleAreaChart = charts.views.AreaChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}
		_.each(data.fields, function (field) {
			dataTable.addColumn(field[0], field[1]);
		});
		dataTable.addRows(data.rows);
		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());
		if (_.isUndefined(dataTable)) {
			return;
		}
		var options = (this.model.get('options') || {});

		// Stacked config -> Always true, so we force it.
		options.isStacked = true;

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Show X Axis
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			
			// Check if Options has configs for hAxis
			if( _.isUndefined( options.hAxis ) ){

				// Check if is object
				if( !_.isObject( options.hAxis ) ){
					options.hAxis = {}
				}

			}

			// No mostrar eje X si esta indicado como false
			if( !this.model.get('showXAxis') ){
				options.hAxis.baselineColor = 'none';
				options.hAxis.gridlineColor = 'none';
				options.hAxis.textPosition = 'none';
				options.hAxis.ticks = [];
			}

		}

		// Show Y Axis
		if( !_.isUndefined( this.model.get('showYAxis') ) ){

			// Check if Options has configs for vAxis
			if( _.isUndefined( options.vAxis ) ){

				// Check if is object
				if( !_.isObject( options.vAxis ) ){
					options.vAxis = {}
				}

			}
		
			// No mostrar eje Y si esta indicado como false
			if( !this.model.get('showYAxis') ){
				options.vAxis.baselineColor = 'none';
				options.vAxis.gridlineColor = 'none';
				options.vAxis.textPosition = 'none';
				options.vAxis.ticks = [];
			}

		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('area',options);

		this.chart = new google.visualization.AreaChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}
});


charts.views.GoogleBarChart = charts.views.BarChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}
		_.each(data.fields, function (field) {
			dataTable.addColumn(field[0], field[1]);
		});
		dataTable.addRows(data.rows);
		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());
		if (_.isUndefined(dataTable)) {
			return;
		}

		var options = (this.model.get('options') || {});

		//options.chartArea = {'width': '100%', 'height': '80%'};
		options.chartArea = {
			'top': 80,
			'height': '80%'
		};

		// Stacked config
		options.isStacked = this.model.get('isStacked');

		// Show X Axis
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			
			// Check if Options has configs for hAxis
			if( _.isUndefined( options.hAxis ) ){

				// Check if is object
				if( !_.isObject( options.hAxis ) ){
					options.hAxis = {}
				}

			}

			// No mostrar eje X si esta indicado como false
			if( !this.model.get('showXAxis') ){
				options.hAxis.baselineColor = 'none';
				options.hAxis.gridlineColor = 'none';
				options.hAxis.textPosition = 'none';
				options.hAxis.ticks = [];
			}

		}

		// Show Y Axis
		if( !_.isUndefined( this.model.get('showYAxis') ) ){

			// Check if Options has configs for vAxis
			if( _.isUndefined( options.vAxis ) ){

				// Check if is object
				if( !_.isObject( options.vAxis ) ){
					options.vAxis = {}
				}

			}
		
			// No mostrar eje Y si esta indicado como false
			if( !this.model.get('showYAxis') ){
				options.vAxis.baselineColor = 'none';
				options.vAxis.gridlineColor = 'none';
				options.vAxis.textPosition = 'none';
				options.vAxis.ticks = [];

				// Changes on chart Area
				options.chartArea.width = '70%';
				options.chartArea.left = 80;

			}

		}

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';

			// Set if no X axis shown
			if( !_.isUndefined( this.model.get('showXAxis') ) ){
				if( !this.model.get('showXAxis') ){
					// Changes on chart Area
					options.chartArea.width = '80%';
				}
			}

		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';

			// Set if no X axis shown
			if( !_.isUndefined( this.model.get('showXAxis') ) ){
				if( !this.model.get('showXAxis') ){
					// Changes on chart Area
					options.chartArea.width = '80%';
				}
			}

		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('bar',options);

		this.chart = new google.visualization.BarChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}

});

charts.views.GoogleColumnChart = charts.views.ColumnChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}
		_.each(data.fields, function (field) {
			dataTable.addColumn(field[0], field[1]);
		});
		dataTable.addRows(data.rows);
		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());
		if (_.isUndefined(dataTable)) {
			return;
		}
		var options = (this.model.get('options') || {});

		// Stacked config
		options.isStacked = this.model.get('isStacked');

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Show X Axis
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			
			// Check if Options has configs for hAxis
			if( _.isUndefined( options.hAxis ) ){

				// Check if is object
				if( !_.isObject( options.hAxis ) ){
					options.hAxis = {}
				}

			}

			// No mostrar eje X si esta indicado como false
			if( !this.model.get('showXAxis') ){
				options.hAxis.baselineColor = 'none';
				options.hAxis.gridlineColor = 'none';
				options.hAxis.textPosition = 'none';
				options.hAxis.ticks = [];
			}

		}

		// Show Y Axis
		if( !_.isUndefined( this.model.get('showYAxis') ) ){

			// Check if Options has configs for vAxis
			if( _.isUndefined( options.vAxis ) ){

				// Check if is object
				if( !_.isObject( options.vAxis ) ){
					options.vAxis = {}
				}

			}
		
			// No mostrar eje Y si esta indicado como false
			if( !this.model.get('showYAxis') ){
				options.vAxis.baselineColor = 'none';
				options.vAxis.gridlineColor = 'none';
				options.vAxis.textPosition = 'none';
				options.vAxis.ticks = [];
			}

		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('column',options);

		this.chart = new google.visualization.ColumnChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}

});

charts.views.GooglePieChart = charts.views.PieChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();

		var graphData = [];

		_.each(data.rows,function(e,i){
			graphData.push([e[0],e[1]]);
		});

		dataTable.addColumn('string', 'Label');
		dataTable.addColumn('number', 'Data');

		dataTable.addRows(graphData);

		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){

		var dataTable = this.formatData(this.model.data.toJSON());

		var options = (this.model.get('options') || {});

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('pie',options);

		this.chart = new google.visualization.PieChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}

});

charts.views.GoogleDonutChart = charts.views.DonutChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();

		var graphData = [];

		_.each(data.rows,function(e,i){
			graphData.push([e[0],e[1]]);
		});

		dataTable.addColumn('string', 'Label');
		dataTable.addColumn('number', 'Data');

		dataTable.addRows(graphData);

		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){

		var dataTable = this.formatData(this.model.data.toJSON());

		var options = (this.model.get('options') || {});

		// Set specific donnut chart option
		options['pieHole'] = 0.4;

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'right';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('donut',options);

		this.chart = new google.visualization.PieChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	},

});

charts.views.GoogleGeoChart = charts.views.Chart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);

		this.stylesDefault = this.model.get("geomapStylesDefault");
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();

		var graphData = [];

		_.each(data.locations,function(e,i){
			graphData.push([e.iso, e.value]);
		});

		dataTable.addColumn('string', 'Label');
		dataTable.addColumn('number', 'Data');

		dataTable.addRows(graphData);

		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());

		var colors = []
		var minColor = this.model.get('geoMapColorMin') || '#FF0000'
		var midColor = this.model.get('geoMapColorMiddle') 
		var maxColor = this.model.get('geoMapColorMax') || '#00FF00'
		colors.push(minColor)
		if (midColor) {
			colors.push(midColor)
		}
		colors.push(maxColor)
		var region = this.model.get('geoMapDisplayValue') || "world"
		var disOption = this.model.get('geoMapDisplayOption')
		var resolution = 'countries'
		if (disOption == 'countries') {
			resolution = 'provinces'
		}
		var options = {
			region: region,
			resolution: resolution,
			colorAxis: {colors: colors},
			backgroundColor: this.model.get('geoMapColorBackground') || 'white',
			datalessRegionColor: this.model.get('geoMapColorDataless') || '#F5F5F5',
			defaultColor: this.model.get('geoMapColorDefault') || '#267114',
			displayMode: this.model.get('geoMapDisplayType') || 'auto',
		};

		this.chart = new google.visualization.GeoChart(this.el);

		this.chart.draw(dataTable, options);

		return this;
	}

});

charts.views.GoogleTornadoChart = charts.views.TornadoChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}

		// Solo necesitamos los primeros 3 valores
		if(data.fields.length > 3){
			data.fields.length = 3;
		}

		_.each(data.fields, function (field) {
			dataTable.addColumn(field[0], field[1]);
		});

		// Para tornadochart necesitamos solo los primeros 3 valores de cada array dentro de rows (label, y los dos series a representar)
		// Para eso, excluimos todo valor agregado
		var newRows = [];
		_.each(data.rows, function(row){

			// Solo necesitamos los primeros 3 valores
			if( row.length > 3){
				row.length = 3;
			}

			// Construyo los valores como los necesito
			var newRow = [];

			// Empujo el primer valor tal cual viene
			newRow.push(row[0]);

			// Preparamos el segundo valor
			var negValue = row[1];

			// Math.sign / -1 == numero negativo / 0 == numero cero
			// Entonces, si es positivo
			if( Math.sign(negValue) > 0 ){
				negValue = negValue * -1;
			}

			// Empujo el segundo valor como numero negativo
			newRow.push(negValue);

			// Empujo el tercer valor tal cual viene
			newRow.push(row[2]);

			// Empujo la fila de valores al array de Filas
			newRows.push(newRow);

		});

		dataTable.addRows(newRows);

		return dataTable;
	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		if (_.isUndefined(this.model)) return;

		var dataTable = this.formatData(this.model.data.toJSON());

		if (_.isUndefined(dataTable))	return;

		var options = (this.model.get('options') || {});

		// Force isStacked true, since is Tornado Chart
		options.isStacked = true;

		// Force Tooltip to be HTML
		options.tooltip = {isHtml: true};

		// Show X Axis
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			
			// Check if Options has configs for hAxis
			if( _.isUndefined( options.hAxis ) ){

				// Check if is object
				if( !_.isObject( options.hAxis ) ){
					options.hAxis = {}
				}

			}

			// Ocultar lineas de grilla interna del grafico
			options.hAxis.gridlineColor = 'none';

			// Quitar los numeros del eje
			options.hAxis.ticks = [];

			// No mostrar eje X si esta indicado como false
			if( !this.model.get('showXAxis') ){
				options.hAxis.baselineColor = 'none';
				options.hAxis.textPosition = 'none';
			}

		}

		// Show Y Axis
		if( !_.isUndefined( this.model.get('showYAxis') ) ){

			// Check if Options has configs for vAxis
			if( _.isUndefined( options.vAxis ) ){

				// Check if is object
				if( !_.isObject( options.vAxis ) ){
					options.vAxis = {}
				}

			}

			// Value responsible for inverse the bar chart from desending to accending order
			//options.vAxis.direction = -1;
			
			// Ocultar lineas de grilla interna del grafico
			options.vAxis.gridlineColor = 'none';

			// No mostrar eje Y si esta indicado como false
			if( !this.model.get('showYAxis') ){
				options.vAxis.baselineColor = 'none';
				options.vAxis.textPosition = 'none';
				options.vAxis.ticks = [];
			}

			// options.vAxes = [{
			//     minValue: 0,
			//     //maxValue: 2500
			// }, {
			//     minValue: 0,
			//     //maxValue: 30
			// }];

		}

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		if( !ifLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}else{
			options.legend = {}
			options.legend.position = 'bottom';
			options.legend.alignment = 'center';
		}

		// Si showLegend esta en false, no se puede mostrar directamente la leyenda
		var showLegend = this.model.checkLegend();
		if( !showLegend ){
			options.legend = {}
			options.legend.position = 'none';
		}

		// Set Color palette
		options.colors = Configuration.chartStylesDefault;

		// console.log('tornado',options);

		this.chart = new google.visualization.BarChart(this.el);

		this.chart.draw(dataTable, options);

		// Replace negative value on tooltip
		google.visualization.events.addListener(this.chart, 'onmouseover', function (e) {
			if (e.row != null && e.column == 1) {
				var tooltipTextLabel = $(".google-visualization-tooltip-item-list li:eq(1) span:eq(1)");
				var val = tooltipTextLabel.html();
				if( Math.sign(parseFloat(val)) < 0 ){
					val = val * -1;
					tooltipTextLabel.html(val).css('display', 'block');
				}
			}
		});

		return this;
	}

});

charts.views.GoogleTreemapChart = charts.views.TreemapChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);

		this.stylesDefault = this.model.get("treemapStylesDefault");
	},

	formatData: function (data) {

		let dataTable = new google.visualization.DataTable();
		if (data.fields.length === 0) {
			return;
		}

		let treemapData = [];

		/**
		 * 
		 * Google Treemap Data needs this format:
		 * 
		 * treemapData = [
		 * 
		 * 	// Chart Labels (won't work without this)
		 * 	['Node','Parent','Value'], 
		 * 
		 * 	// Root node
		 * 	// First position, Root Node ID
		 * 	// Second Position, need to be set to null (mandatory)
		 * 	// Third position, leave as 0 (it will not be contemplated)
		 * 	['America',null,0], 
		 * 
		 * 	// Nodes rows (all you want).
		 * 	// First position, Node ID
		 * 	// Second Position, Node parent (needs to be the root node ID)
		 * 	// Third position, Node value
		 * 	['Brazil','America',11], 
		 * 	['USA','America',52],
		 * 	['Mexico','America',24],
		 * 	['Canada','America',16]
		 * 
		 * ];
		 * 
		*/

		// First row just labels the chart needs. Without this, it does not work.
		treemapData.push(['Label','Parent','Value']);

		// Second Row is the Root node. We use the "Legend" Data Selection here
		let legend = ( ( data.fields.length >= 2 ) ? data.fields[1][1] : 'Total' );
		treemapData.push([legend,null,0]);

		// Next, push all the Node rows you need. In the middle use the legend value to match the relation needed.
		let total = 0;
		_.each(data.rows, function(row){
			treemapData.push([row[0],legend,row[1]]);
			total += row[1];
		});

		// Finally, we update the value of the legend (which will be ignored from the chatrt, but we will use later to retreive the total and calculate % of rectangle in the tooltip)
		treemapData[1][2] = total;

		return google.visualization.arrayToDataTable(treemapData);

	},

	render: function () {
		// Si aun no se cargo el plugin, espera
		if (!google.visualization || !google.visualization.events){
			google.charts.setOnLoadCallback(this.actualRender);
		} else {
			this.actualRender();
		}
	},

	actualRender: function(){
		var dataTable = this.formatData(this.model.data.toJSON());
		if (_.isUndefined(dataTable)) {
			return;
		}

		var language = ( Configuration.language == 'es' ) ? 'es-ES' : 'en-US',
			total = dataTable.getValue(0, 2);

		var options = {
				
			minColor: this.model.get('treemapColorMin') || '#eee5db',
			midColor: this.model.get('treemapColorMiddle') || '#88c181',
			maxColor: this.model.get('treemapColorMax') || '#109618',
			fontColor: this.model.get('treemapColorFont') || '#000',
			headerColor: this.model.get('treemapColorHeader') || '#6c9c8a',

			textStyle: {
				bold: true,
			},

			// @param row es el el indice de fila
			// @param size es el valor de la fila
			// @param value tiene que ver con el value del color en relacion al size (no la usamos a esta funcionadad aún)
			generateTooltip: function(row, size, value){

				let perc_calc = (size*100)/total,
					percentage = ( perc_calc == 100 ) ? perc_calc : perc_calc.toLocaleString(language, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

				return `
					<div style="background:#fff;padding:10px;box-shadow:0 0 15px 0 rgba(255,255,255,.2);">
						<div>${dataTable.getValue(row, 0)}</div>
						<div>
							<strong style="font-family:'halyard-display-bold', Arial, Helvetica, sans-serif;">${size} (${percentage}%)</strong>
						</div>
					</div>
				`;		

			},

			// Configuramos esto con un array vacio para que no se pueda hacer drilldown o rollup.
			// A futuro: Ver como agregar las relaciones para poder ampliar las capacidades del treemap.
			eventsConfig:{
				rollup: [],
				drilldown: [],
			},

		}

		// Scale configuration
		if( this.model.get('showScale') ){
			options.showScale = true;
		}else{
			options.showScale = false;
		}

		this.chart = new google.visualization.TreeMap(this.el);
		this.chart.draw(dataTable, options);

		return this;
	},

});