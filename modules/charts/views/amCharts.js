var charts = charts || {
	models: {},
	views: {}
};

charts.views.AmLineChart = charts.views.LineChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {

		// First get to know object names, and put them on list object.
		var list = [];
		_.each(data.fields, function(field, i){
			if( i == 0 ){
				list.push('labels');	
			}else{
				list.push('series'+(i-1));
			}
		});			

		// Create chartData array
		var chartData = _.map(data.rows, function(row, index){
			return _.object(list,row);
		});

		return chartData;

	},

	render: function(){

		// Options Object
		var options = {}

		// Add data
		options.data = this.formatData(this.model.data.toJSON());

		// Show X Axis
		var showXAxis = true;
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			showXAxis = this.model.get('showXAxis');
		}

		// X axis
		options.xAxes = [{
			id: 'xAxis',
			type: 'CategoryAxis',
			dataFields: {
				category: 'labels'
			},
			renderer: {
				minGridDistance: 100
			},
			hidden: !showXAxis,
		}];

		// Pre zoom
		// options.events = {
  //   	ready: function(ev) {

  //   		console.log(ev.target.dataItems);

  //   		var dataItems = ev.target.dataItems;
  //   		var startIndex = 0;
  //   		var endIndex = dataItems.values.length;
		// 		if( endIndex > 365 ){
		// 			endIndex = 365;
		// 		}
  //     	ev.target.xAxes.getIndex(0).zoomToIndexes(startIndex, endIndex);
  //   	}
  // 	}

		// Show Y Axis
		var showYAxis = true;
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			showYAxis = this.model.get('showYAxis');
		}
		
		// Y axis
		options.yAxes = [{
			id: 'yAxis',
			type: 'ValueAxis',
			hidden: !showYAxis,
		}];

		// Series
		options.series = [];
		var seriesID = [];
		var fields = this.model.data.get('fields');
		_.each(fields, function(serie, index){

			// We do not need first value
			if( index != 0 ){

				var i = index - 1,
					legendText = serie[1];

				// Save ID for later
				seriesID.push('s'+i);

				// Configure each serie
				options.series.push({
					id: 's'+i,
					type: "LineSeries",
					dataFields:{
						valueY: "series"+i,
						categoryX: "labels",
					},
					legendSettings:{
						labelText: legendText,
					},
					strokeWidth: 2,
					minBulletDistance: 0,
					tooltipText: "{valueY}",
					tooltip: {
						pointerOrientation: "vertical",
						background: {
							cornerRadius: 20,
							fillOpacity: 0.5,
						}
					}
				});

			}

		});

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		var showLegend = this.model.checkLegend();

		// Check legend
		if( ifLegend && showLegend ){
			options.legend = {
				position: 'right',
				width: 120
			}
		}

		// Zoom Scrollbar
		// if( this.model.get('explorer') ){
		// 	options.scrollbarX = {
		// 		//type: 'XYChartScrollbar',
		// 		type: 'Scrollbar',
		// 		series: seriesID // reference series by its id
		// 	}
		// }

		// Cursor
		options.cursor = {
			xAxis: 'xAxis',
			behaviour: "zoomX",
		}

		// Set color palette
		options.colors = {
			list: _.toArray(Configuration.chartStylesDefault),
		}

		// console.log('line',options);

		// Hack para ficha de VIZ en este tipo de grafico.
		this.$el.css({
			padding:0
		});

		// Set amCharts Theme
		//am4core.useTheme(am4themes_animated);

		// Generate Chart
		this.chart = am4core.createFromConfig(options, this.el, "XYChart");

		// Move Zoom Scrollbar position to bottom
		// if( this.model.get('explorer') ){
		// 	this.chart.scrollbarX.parent = this.chart.bottomAxesContainer;
		// }

	},

});

charts.views.AmAreaChart = charts.views.AreaChart.extend({
	initialize: function (options) {
		this.constructor.__super__.initialize.apply(this, arguments);
	},

	formatData: function (data) {
		
		// First get to know object names, and put them on list object.
		var list = [];
		_.each(data.fields, function(field, i){
			if( i == 0 ){
				list.push('labels');	
			}else{
				list.push('series'+(i-1));
			}
		});			

		// Create chartData array
		var chartData = _.map(data.rows, function(row, index){
			return _.object(list,row);
		});

		return chartData;

	},

	render: function(){

		// Options Object
		var options = {}

		// Add data
		options.data = this.formatData(this.model.data.toJSON());

		// Show X Axis
		var showXAxis = true;
		if( !_.isUndefined( this.model.get('showXAxis') ) ){
			showXAxis = this.model.get('showXAxis');
		}

		// X axis
		options.xAxes = [{
			id: 'xAxis',
			type: 'CategoryAxis',
			dataFields: {
				category: 'labels'
			},
			renderer: {
				minGridDistance: 100
			},
			hidden: !showXAxis,
		}];

		// Show Y Axis
		var showYAxis = true;
		if( !_.isUndefined( this.model.get('showYAxis') ) ){
			showYAxis = this.model.get('showYAxis');
		}
		
		// Y axis
		options.yAxes = [{
			id: 'yAxis',
			type: 'ValueAxis',
			hidden: !showYAxis,
		}];

		// Series
		options.series = [];
		var seriesID = [];
		var fields = this.model.data.get('fields');
		_.each(fields, function(serie, index){

			// We do not need first value
			if( index != 0 ){

				var i = index - 1,
					legendText = serie[1];

				// Save ID for later
				seriesID.push('s'+i);

				// Configure each serie
				options.series.push({
					id: 's'+i,
					type: "LineSeries",
					dataFields:{
						valueY: "series"+i,
						categoryX: "labels",
					},
					legendSettings:{
						labelText: legendText,
					},
					strokeWidth: 2,
					fillOpacity: 0.6,
					stacked: true,
					minBulletDistance: 0,
					tooltipText: "{valueY}",
					tooltip: {
						pointerOrientation: "vertical",
						background: {
							cornerRadius: 20,
							fillOpacity: 0.5,
						}
					}
				});

			}

		});

		// Legend configuration
		var ifLegend = this.model.get('showLegend');
		var showLegend = this.model.checkLegend();

		// Check legend
		if( ifLegend && showLegend ){
			options.legend = {
				position: 'right',
				width: 120
			}
		}

		// Zoom Scrollbar
		// if( this.model.get('explorer') ){
		// 	options.scrollbarX = {
		// 		// type: 'XYChartScrollbar',
		// 		type: 'Scrollbar',
		// 		series: seriesID // reference series by its id
		// 	}
		// }

		// Cursor
		options.cursor = {
			xAxis: 'xAxis',
			behaviour: "zoomX",
		}

		// Set color palette
		options.colors = {
			list: _.toArray(Configuration.chartStylesDefault),
		}

		// console.log('line',options);

		// Hack para ficha de VIZ en este tipo de grafico.
		this.$el.css({
			padding:0
		});

		// Set amCharts Theme
		//am4core.useTheme(am4themes_animated);

		// Generate Chart
		this.chart = am4core.createFromConfig(options, this.el, "XYChart");

		// Move Zoom Scrollbar position to bottom
		// if( this.model.get('explorer') ){
		// 	this.chart.scrollbarX.parent = this.chart.bottomAxesContainer;
		// }

	},

});
