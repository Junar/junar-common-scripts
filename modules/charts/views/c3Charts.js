var charts = charts || {
	models: {},
	views: {}
};


charts.views.C3LineChart = charts.views.LineChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var labels = [];
		labels.push(_.map(data.fields, function (field) {return field[1];}));
		
		labels[0][0] = 'x';

		var categories = [];
		categories.push(_.map(data.rows, function (r) {return r[0];}));

		return {
			labels:labels,
			categories:categories,
			values:data.rows
		};
	},
	
	render: function () {
		var data = this.formatData(this.model.data.toJSON());

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		// Axis Configuration
		var axis = {
			x: {
				type: 'category', // this needed to load string x value
				show: true,
				tick: {
					culling: true,
				},
			},
			y: {
				show: true
			},
		};
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			axis.x.show = this.model.get('showXAxis');
		}
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			axis.y.show = this.model.get('showYAxis');
		}

		// Zoom Configuration
		var zoomSettings = {
			enabled: false
		}

		// // If defined zoomMode
		// if( !_.isUndefined( this.model.get('explorer') ) ){
		// 	if( !_.isNull( this.model.get('explorer') ) ){

		// 		zoomSettings.enabled = true;

		// 		switch( this.model.get('explorer') ){

		// 			// Zoom type drag
		// 			case 'drag':
		// 				zoomSettings.type = 'drag';
		// 				break;

		// 			// Zoom type scroll
		// 			case 'scroll':

		// 				break;

		// 		}				

		// 	}
		// }

		this.chart = c3.generate({
			bindto: this.el,
			data: {
				x: 'x',
				rows: data.labels.concat(data.values),
				groups: data.categories
			},
			type: 'line',
			axis: axis,
			legend: {
				position: 'right',
				show: showLegend
			},
			zoom: zoomSettings,
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		});
	},

});

charts.views.C3AreaChart = charts.views.LineChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		var labels = [];
		labels.push(_.map(data.fields, function (field) {return field[1];}));
		
		labels[0][0] = 'x';

		var categories = [];
		categories.push(_.map(data.rows, function (r) {return r[0];}));

		var finalData = labels.concat(data.rows);

		finalData = _.zip.apply(_, finalData);

		return {
			labels:labels,
			categories:categories,
			values:finalData
		};
	},
	
	render: function () {
		 var data = this.formatData(this.model.data.toJSON());

		var types = {};
		var groups = [];

		_.each(data.labels[0],function(e){
			if(e!='x'){
				types[e] = 'area-spline';
				groups.push(e);
			}
		});

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		// Axis Configuration
		var axis = {
			x: {
				type: 'category', // this needed to load string x value
				show: true
			},
			y: {
				show: true
			},
		};
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			axis.x.show = this.model.get('showXAxis');
		}
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			axis.y.show = this.model.get('showYAxis');
		}

		this.chart = c3.generate({
			bindto: this.el,
			data: {
				x: 'x',
				columns: data.values,
				types: types,
				groups: [groups]
			},
			axis: axis,
			legend: {
				position: 'right',
				show: showLegend
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		});
	}
});

charts.views.C3BarChart = charts.views.BarChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (dataModel) {
		var data = dataModel.get('rows'),
			fieldnames = [_.map(dataModel.get('fields'), function (field) {
				return field[1];
			})];
		return fieldnames.concat(data);
	},

	render: function () {
		var rows = this.formatData(this.model.data);

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		// Axis Configuration
		var axis = {
			rotated: true,
			x: {
				type: 'category', // this needed to load string x value
				show: true
			},
			y: {
				show: true
			},
		};

		// Since its rotated the Axis are inverted
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			axis.y.show = this.model.get('showXAxis');
		}
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			axis.x.show = this.model.get('showYAxis');
		}

		var options = {
			bindto: this.el,
			data: {
				type: 'bar',
				x: rows[0][0],
				rows: rows,
			},
			axis: axis,
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
			},
			legend: {
				position: 'right',
				show: showLegend
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		}

		// Stacked Config
		var isStacked = this.model.get('isStacked');
		if( isStacked ){
			options.data.groups = [_.each(rows[0],function(e, i){
				if(i > 0){
					return e;
				}
			})];
		}

		this.chart = c3.generate(options);

	}
});

charts.views.C3ColumnChart = charts.views.BarChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (dataModel) {
		var data = dataModel.get('rows'),
			fieldnames = [_.map(dataModel.get('fields'), function (field) {
				return field[1];
			})];
		return fieldnames.concat(data);
	},

	render: function () {
		var rows = this.formatData(this.model.data);

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		// Axis Configuration
		var axis = {
			x: {
				type: 'category', // this needed to load string x value
				show: true
			},
			y: {
				show: true
			},
		};
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			axis.x.show = this.model.get('showXAxis');
		}
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			axis.y.show = this.model.get('showYAxis');
		}

		var options = {
			bindto: this.el,
			data: {
				type: 'bar',
				x: rows[0][0],
				rows: rows,
			},
			axis: axis,
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
			},
			legend: {
				position: 'right',
				show: showLegend
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		};

		// Stacked Config
		var isStacked = this.model.get('isStacked');
		if( isStacked ){
			options.data.groups = [_.each(rows[0],function(e, i){
				if(i > 0){
					return e;
				}
			})];
		}

		this.chart = c3.generate(options);

	}
});

charts.views.C3PieChart = charts.views.PieChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
		this.hideLegend = false;
	},

	formatData: function (dataModel) {
		var data = dataModel.get('rows');

		var graphData = [];

		_.each(data,function(e,i){
			graphData.push([e[0],e[1]]);
		});

		return graphData;
	},

	render: function () {
		var self = this;
		var rows = this.formatData(this.model.data);

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		this.chart = c3.generate({
			bindto: this.el,
			data: {
				type: 'pie',
				columns: rows,
			},
			legend: {
				position: 'right',
				hide: self.hideLegend,
				show: showLegend
			},
			onrendered: function () {
				var previousHideLegend = self.hideLegend;

				if (self.chart) {
					self.hideLegend = (this.width < 500);
					if (self.hideLegend !== previousHideLegend) {
						self.render();
					}
				}
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		});
	}
});

charts.views.C3DonutChart = charts.views.DonutChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
		this.hideLegend = false;
	},

	formatData: function (dataModel) {
		var data = dataModel.get('rows');

		var graphData = [];

		_.each(data,function(e,i){
			graphData.push([e[0],e[1]]);
		});

		return graphData;
	},

	render: function () {
		var self = this;
		var rows = this.formatData(this.model.data);

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		this.chart = c3.generate({
			bindto: this.el,
			data: {
				type: 'donut',
				columns: rows,
			},
			legend: {
				position: 'right',
				hide: self.hideLegend,
				show: showLegend
			},
			onrendered: function () {
				var previousHideLegend = self.hideLegend;

				if (self.chart) {
					self.hideLegend = (this.width < 500);
					if (self.hideLegend !== previousHideLegend) {
						self.render();
					}
				}
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		});
	}
});

charts.views.C3TornadoChart = charts.views.BarChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (dataModel) {
		
		var dataModel = dataModel;

		// Solo necesitamos los primeros 3 valores
		if(dataModel.get('fields').length > 3){
			var fields = dataModel.get('fields')
			fields.length = 3;
			dataModel.set('fields',fields);
		}

		var data = dataModel.get('rows');

		// Para tornadochart necesitamos solo los primeros 3 valores de cada array dentro de rows (label, y los dos series a representar)
		// Para eso, excluimos todo valor agregado
		var newRows = [];
		_.each(data, function(row){

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

		var fieldnames = [_.map(dataModel.get('fields'), function (field) {
			return field[1];
		})];

		return fieldnames.concat(newRows);
	},

	render: function () {
		var rows = this.formatData(this.model.data);

		// Legend configuration
		var showLegend = this.model.get('showLegend');
		if( !this.model.checkLegend() ){
			showLegend = false;
		}

		// Axis Configuration
		var axis = {
			rotated: true,
			x: {
				type: 'category', // this needed to load string x value
				show: true
			},
			y: {
				show: false
			},
		};

		// Since its rotated the Axis are inverted
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			axis.x.show = this.model.get('showYAxis');
		}

		var options = {
			bindto: this.el,
			data: {
				type: 'bar',
				x: rows[0][0],
				rows: rows,
			},
			axis: axis,
			bar: {
				width: {
					ratio: 0.5 // this makes bar width 50% of length between ticks
				}
			},
			legend: {
				position: 'bottom',
				show: showLegend,
				item: {
					onclick: function(){
						// Prevent default behaviour of toggling series
					}
				},
			},
			tooltip:{
				contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
					// Check if negative
					if (d[0].value < 0) {
						d[0].value = d[0].value * -1;
					}
					if (d[1].value < 0) {
						d[1].value = d[1].value * -1;
					}
					return this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color);
				}
			},
			color: {
				pattern: Configuration.chartStylesDefault,
			},
		}

		// Stacked Config
		var isStacked = true;
		if( isStacked ){
			options.data.groups = [_.each(rows[0],function(e, i){
				if(i > 0){
					return e;
				}
			})];
		}

		this.chart = c3.generate(options);

	}
});
