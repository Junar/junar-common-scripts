var charts = charts || {
	models: {},
	views: {}
};


charts.views.Chart = Backbone.View.extend({
	initialize: function(){
		if (this.model.get('type') === null) {
			console.error('Chart models must define a type property');
		}
	},

	bindEvents: function () {
		this.model.on('data_updated', this.handleDataUpdated, this);
	},

	handleDataUpdated: function () {
		this.render();
	},

	formatData: function () {
		// reads data from model and returns formated data for the specific
		// subclass
	},

	render: function () {
		// implements rendering of data received from :formatData: for the 
		// specific chart library
	},

	destroy: function(){

		// Destroy leaflet
		if( 
			this.model.get('lib') == 'leaflet' ||  
			// Antes teniamos google maps como una opción. Desde ahora siempre será leaflet para mapchart, por mas que esté seteado como google maps.
			// Forzamos a leaflet, entonce validamos lo siguiente:
			( this.model.get('lib') == 'google' && this.model.get('type') == 'mapchart' )
		) {

			var leafletCtrl = this.mapInstance,
				dom = this.el;

			if (leafletCtrl) {
				// Disable gesture handling
				if (!_.isUndefined(leafletCtrl.gestureHandling)) {
					leafletCtrl.gestureHandling.disable();
				}

				//This removes most of the events
				leafletCtrl.off();

				//After this, the dom element should be good to reuse, unfortunatly it is not
				leafletCtrl.remove();
			}

			this.removeDanglingEvents(dom._leaflet_events, false, dom);
			this.removeDanglingEvents(dom, true, dom);

			// Wildcard removeClass on 'leaflet-*'
			this.$el.removeClass(function (index, classes) {
			  var classesArray = classes.split(' ');
		  	return _.filter(classesArray, function(className){ 
		  		return className.indexOf('leaflet-') === 0;
		  	}).toString();
			});
			this.$el.removeAttr('data-gesture-handling-touch-content');
			this.$el.removeAttr('data-gesture-handling-scroll-content');
			this.$el.html('');

			this.mapInstance = null;

		}else{


			//c3
			if(this.chart && this.chart.destroy){
				this.chart.destroy();
			}

			//google
			if(this.chart && this.chart.clearChart){
				this.chart.clearChart();
			}

			// Tenemos que forzar limpiar el html del div porque el treemap no se limpia bien, y puede pasar con otros graficos.
			this.$el.empty();

		}

		this.stopListening();
		this.undelegateEvents();

	}

});
