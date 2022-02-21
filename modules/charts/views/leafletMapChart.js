var charts = charts || {
	models: {},
	views: {}
};

charts.views.LeafletMapChart = charts.views.MapChart.extend({

	// Map Variables
	mapInstance: null,
	isPopupOpened: false,
	dataLoaded: false,
	
	// Markers variables
	mapMarkers: [],
	mapMarkersLayer: null,

	// Clusters variables
	mapClusters: [],
	mapClustersLayer: null,
	mapClustersSizes: [53, 56, 66, 78, 90],
	mapClustersStyles: [],
	
	// Traces variables
	mapTraces: [],
	mapTracesLayer: null,
	
	// Heatmap variables
	heatMapFeatures: [], 
	heatMapLayer: null,
	heatMapOptions: {},
	onHeatMap: false,


	initialize: function(options){

		this.presettedOptions = options.mapOptions || {};
		
		this.bindEvents();
	},

	render: function(){
		if( _.isNull(this.mapInstance) ){
			this.createMapInstance();
		}
			this.clearMapOverlays();

			var features = this.model.data.get('features');
			var clusters = this.model.data.get('clusters');
			var styles = this.model.data.get('mapStyles');
			var styledFeatures = this.mergeFeaturesAndStyles(features, styles);

			// Create Map Features
			if(!_.isUndefined(features) && features.length !== 0){

				this.createMapFeatures(styledFeatures);

				// Add Markets and Traces Layers to the map
				if(this.mapMarkers.length > 0){
					this.mapMarkersLayer = L.layerGroup(this.mapMarkers).addTo(this.mapInstance);
				}
				if(this.mapTraces.length > 0){
					this.mapTracesLayer = L.layerGroup(this.mapTraces).addTo(this.mapInstance);
				}

			}

			// Create Clusters
			if(!_.isUndefined(clusters) && clusters.length !== 0){

				// Process clusters
				this.createMapClusters(clusters);

				// Add Clusters Layer to the map
				if(this.mapClusters.length > 0){
					this.mapClustersLayer = L.layerGroup(this.mapClusters).addTo(this.mapInstance);
				}

			}

			// Por alguna razon, al hacer zoom, el modelo se reinicia, y se pierde el estado del heatmap, asi que lo checkeamos
			this.checkHeatMapStatus();

			// If heatmap is active, we add it to the map
			if(this.onHeatMap){

				// Remove data layers
				this.clearMapOverlays();

				// Add Heatmap Features to the map
				if(this.heatMapFeatures.length > 0){
					this.heatMapLayer = L.heatLayer(this.heatMapFeatures, this.heatMapOptions).addTo(this.mapInstance);
				}

			// Remove heatmap layer
			}else{
				if( !_.isNull(this.heatMapLayer) ){
					this.mapInstance.removeLayer(this.heatMapLayer);
				}
			}

		
		return this;

	},

	checkHeatMapStatus: function(){
		// Si la tab esta activada, activar flag de heatmap
		if( $('#id_heatmapButton').hasClass('active') ){
			this.onHeatMap = true;
		}
	},

	// Override de la funcion original en la view chart.js
	bindEvents: function(){
		this.listenTo(this.model, 'change:mapType', this.onChangeMapType, this);
	},

	mergeFeaturesAndStyles: function (features, styles) {
		var self = this,
			result;
		var mapStyles={}
		 _.each(styles, function (style) {
			mapStyles[style.id]=style;
		 });

		if (_.isUndefined(mapStyles) || mapStyles.length === 0) {
			result = features;
		} else {
			result = _.map(features, function (feature) {
				feature.styles = "";
				feature.mapStylesId.forEach(function(featureStyle){
					// si  no tiene un hash en el hashmap, usa el estilo default
					if ( ! _.isUndefined(mapStyles[featureStyle]) ){
	
						var mapStyle= mapStyles[featureStyle];
	
						// si no viene con styles
						if ( _.isEmpty(mapStyle.styles)){
							var style={}
							for (var firstKey in mapStyles[featureStyle].pairs) {
								style[mapStyles[featureStyle].pairs[firstKey]]={"style":mapStyles[firstKey].styles};
							};
							feature.styles += style['normal'].style;
	
						// si el mapStyle trae style, usamos ese
						}else{
							feature.styles += mapStyle.styles;
						}
					}
				})
	
				return feature;
			});
 
		 }

		return result;
	},

	onChangeMapType: function (model, type) {
		if(this.mapInstance) {

			var self = this;

			// Remuevo tipo tileLayer
			_.each(this.mapTileLayer,function(tileLayer){
				self.mapInstance.removeLayer(tileLayer);
			});

			// Cambiar el tipo de tileLayer
			this.mapTileLayer = this.getTileLayer(type);

			// Actualizo el tipo de mapa en el modelo
			this.model.set('mapType', type);

			// Agrego el nuevo tipo de tileLayer al mapa
			_.each(this.mapTileLayer,function(tileLayer){
				self.mapInstance.addLayer(tileLayer);
			});
		}
	},
	
	/**
	 * Add event handlers to the map events
	 */
	bindMapEvents: function(){

		// This options are used in the create/edit visualization tool and by default it used the googleMaps variable notation
		if( _.size(this.presettedOptions) > 0 && !_.isUndefined(this.presettedOptions.draggable) ){
			
			// Dragging
			if( this.presettedOptions.draggable ){
				
				// For some reason, when adding the plugin for gestureHandling, after first destroy of the map it does not enable click+dragging, so we force it manually.
				this.mapInstance.dragging.enable();

			}

		}else{

			// For some reason, when adding the plugin for gestureHandling, after first destroy of the map it does not enable click+dragging, so we force it manually.
			this.mapInstance.dragging.enable();

		}

		var self = this;

		// On Popup Open
		this.mapInstance.on('popupopen', function(){
			self.isPopupOpened = true;
		});

		// On Popup Close
		this.mapInstance.on('popupclose', function(){
			self.isPopupOpened = false;
		});

		// On click event
		this.mapInstance.on('click', this.onMapClickEvent.bind(this));

		// On moveend event
		this.mapInstance.on('moveend', this.handleBoundChanges.bind(this));

	},

	/**
	 * Creates a new Leaflet map instance
	 */
	createMapInstance: function(){

		//window.FeatureerEvent = null;

		var self = this,
			mapInitialOptions = {
				zoom: this.model.get('options').zoom,
				zoomControl: false, // Is set to false, in order to position it on another place after creating the instance
				minZoom: 1,
				gestureHandling: true,
				fullscreenControl: true,
			};

		// Set Center if defined
		var center = this.model.get('options').center;
		if( !_.isUndefined(center) ){
			mapInitialOptions.center = L.latLng(
				center.lat,
				center.long
			);
		}

		// Set Bounds if defined
		var b = this.model.get('options').bounds;
		if( !_.isUndefined(b) ){

			var bounds = L.latLngBounds([
				[parseFloat(b[2]), parseFloat(b[3])],
				[parseFloat(b[0]), parseFloat(b[1])],
			]);

			// Bounds override center
			mapInitialOptions.center = bounds.getCenter();

		}

		// Set Map Type
		this.mapTileLayer = this.getTileLayer(this.model.get('mapType'));
		mapInitialOptions.layers = this.mapTileLayer;

		// This options are used in the create/edit visualization tool and by default it used the googleMaps variable notation
		if( _.size(this.presettedOptions) > 0 ){

			var newOptions = {}

			// Dragging
			if( !_.isUndefined(this.presettedOptions.draggable) ){
				newOptions.dragging = this.presettedOptions.draggable;
				newOptions.tap = this.presettedOptions.draggable;
			}

			// Double Click zoom
			if( !_.isUndefined(this.presettedOptions.disableDoubleClickZoom) ){
				// has to be opposite since googleMaps "disables" and Leaflet "enables", that's why we put ! before
				newOptions.doubleClickZoom = !this.presettedOptions.disableDoubleClickZoom;
			}

			// ScrollWheelZoom
			if( !_.isUndefined(this.presettedOptions.scrollwheel) ){
				newOptions.scrollWheelZoom = this.presettedOptions.scrollwheel;
				if(!newOptions.scrollWheelZoom){
					newOptions.gestureHandling = false;
				}
			}

			mapInitialOptions = _.extend(mapInitialOptions, newOptions);

		}


		// Empty $el container in DOM, since leaflet appends to it, and not erase previous content
		this.$el.html('');

		// Create Map
		this.mapInstance = L.map(this.el, mapInitialOptions); 

		// This options are used in the create/edit visualization tool and by default it used the googleMaps variable notation
		if( _.size(this.presettedOptions) > 0 ){
			if( !_.isUndefined(this.presettedOptions.zoomControl) ){
				if( this.presettedOptions.zoomControl ){

					// Adds zoom control positioned bottom right
					L.control.zoom({position:'bottomright'}).addTo(this.mapInstance);

				}
			}

		// Adds zoom control positioned bottom right
		}else{
			L.control.zoom({position:'bottomright'}).addTo(this.mapInstance);
		}

		// Set Default Map Styles
		this.stylesDefault = this.model.get("mapStylesDefault");

		// Create Map Clusters Styles
		this.createMapClustersStyles();

		// Generate Heatmap Options
		this.heatMapOptions = {
			radius: 20,
			minOpacity: 0.8,
			maxZoom: this.mapInstance.getMaxZoom(),
		}
		
		// Bind Map Events
		this.bindMapEvents();

	},

	/** 
	 * Gets mapType (Tile Layer) for leaflet
	 */
	getTileLayer: function(mapType){

		// OPEN STREET MAP
		// roadmap -> OpenStreetMap.Mapnik
		// satellite -> NONE
		// hybrid -> NONE
		// terrain -> OpenTopoMap

		// ESRI
		// roadmap -> Esri.WorldStreetMap
		// satellite -> Esri.WorldImagery
		// hybrid -> NONE -> TEST CartoDB.PositronOnlyLabels + Esri.WorldImagery
		// terrain -> Esri.WorldTopoMap

		// CARTODB
		// roadmap -> CartoDB.Voyager
		// satellite -> NONE
		// hybrid -> NONE
		// terrain -> NONE

		// STAMEN
		// roadmap -> Stamen.TonerLite
		// satellite -> NONE
		// hybrid -> NONE
		// terrain -> Stamen.Terrain
		
		// Add tileLayer using leaflet-providers
		var mapType = mapType,
			tileLayer = [];
		
		// Using ESRI as default
		switch(mapType){
			case 'roadmap':
			case 'ROADMAP':
				tileLayer.push( L.tileLayer.provider('Esri.WorldStreetMap') );
				break;
			case 'maritime':
			case 'MARITIME':
				tileLayer.push( L.tileLayer.provider('OpenStreetMap.Mapnik') );
				break;
			case 'satellite':
			case 'SATELLITE':
				tileLayer.push( L.tileLayer.provider('Esri.WorldImagery') );
				break;
			case 'hybrid':
			case 'HYBRID':
				tileLayer.push( L.tileLayer.provider('Esri.WorldImagery') );
				tileLayer.push( L.tileLayer.provider('CartoDB.PositronOnlyLabels') );
				break;
			case 'terrain':
			case 'TERRAIN':
				tileLayer.push( L.tileLayer.provider('Esri.WorldTopoMap') );
				break;
			default:
				tileLayer.push( L.tileLayer.provider('Esri.WorldStreetMap') );
		} 

		return tileLayer;

	},

	/**
	 * Remueve los elementos del mapa y elimina cualquier evento asociado a estos
	 */
	clearMapOverlays: function(){
		//Markers
		this.mapMarkers = this.clearOverlay(this.mapMarkers);
		//Clusters
		this.mapClusters = this.clearOverlay(this.mapClusters);
		//Traces
		this.mapTraces = this.clearOverlay(this.mapTraces);
	},

	/**
	 * Elimina una coleccion especifica de elementos sobre el mapa
	 * @param  {array} overlayCollection
	 */
	clearOverlay: function (overlayCollection) {

		for(var i = 0; i < overlayCollection.length; i++){
			if (_.isUndefined(overlayCollection[i])) return;
			this.mapInstance.removeLayer(overlayCollection[i]);
		}

		return [];

	},

	/**
	 * Crea puntos en el mapa, pueden ser de tipo traces o markers
	 */
	createMapFeatures: function (features) {
		_.each(features, function (feature, index) {
			if(feature.trace){
				this.createMapTrace(feature, index);
			} else {
				this.createMapMarker(feature, index);
			}
		}, this);
	},

	/**
	 * Crea un trace de puntos dentro del mapa
	 * @param  {object} feature   Objeto con el trace de los puntos en el mapa
	 * @param  {int} index      Indice del trace en el arreglo local de traces
	 * @param  {object} styles  Estilos para dibujar el trace
	 */
	createMapTrace: function (feature, index) {

		var paths = _.map(feature.trace, function (traceFeature, index) {
			return [parseFloat(traceFeature.lat), parseFloat(traceFeature.long)];
		});

		var styles = this.parseKmlStyles(feature.styles);
		
		// Para ser un poligono debe ser mayor a 4 puntos
		if( paths.length >= 4 ){
			var isPolygon = (paths[0][0] == paths[paths.length-1][0] && paths[0][1] == paths[paths.length-1][1]);
		}else{
			var isPolygon = false;
		}
		if(isPolygon){
			var obj = this.createMapPolygon(paths, styles.polyStyle);
		}else{
			var obj = this.createMapPolyline(paths, styles.lineStyle);    
		}

		// Trace Popup (infowindow)
		if(feature.info){
			var infowindow = this.infowindowTemplate(feature.info);
			obj = obj.bindPopup(infowindow);
		}		

		this.mapTraces.push(obj);

	},

	createMapPolygon: function (paths, styles) {

		var pathStyles = {
			color: styles.strokeColor,
			opacity: styles.strokeOpacity,
			weight: styles.strokeWeight,
			fillColor: styles.fillColor,
			fillOpacity: styles.fillOpacity
		};

		// Add to heatmap
		var self = this;
		_.each(paths, function(path){
			self.addHeatmapFeature({lat: path[0], long: path[1]});
		});

		var polygon = L.polygon(paths, pathStyles);

		return polygon;
	},

	createMapPolyline: function (paths, styles) {

		var pathStyles = {
			color: styles.strokeColor,
			opacity: styles.strokeOpacity,
			weight: styles.strokeWeight
		};

		// Add to heatmap
		var self = this;
		_.each(paths, function(path){
			self.addHeatmapFeature({lat: path[0], long: path[1]});
		});
		
		var polyline = L.polyline(paths, pathStyles);

		return polyline;
	},

	/**
	 * Crea un marker dentro del mapa
	 * @param  {object} feature   Objeto con las coordenadas del punto en el mapa
	 * @param  {int}    index   Indice del punto en el arreglo local de markers
	 * @param  {object} styles  Estilos para dibujar el marker
	 */
	createMapMarker: function (feature, index) {

		if( _.isUndefined(feature.trace) ){

			var iconUrl = this.stylesDefault.marker.icon,
				markerOptions = {};

			// Add to heatmap
			this.addHeatmapFeature(feature);

			// Obtiene el estilo del marcador
			if(feature.styles && feature.styles.iconStyle){
				// TODO For now personalized KMLFile-included markers files are not readable for us
				if (undefined !== feature.styles.iconStyle.href) {
					//just if it's a external link
					if (feature.styles.iconStyle.href.indexOf("http") > -1) {
						
						// Set Custom Icon URL
						iconUrl = feature.styles.iconStyle.href;

					}
				}			
			}

			// Config marker icon image
			markerIcon = L.icon({
				iconUrl: iconUrl,
			});

			// Market options
			markerOptions.icon = markerIcon;

			var obj = L.marker(L.latLng(parseFloat(feature.lat), parseFloat(feature.long)), markerOptions);

			// Marker Popup (infowindow)
			if(feature.info){
				var infowindow = this.infowindowTemplate(feature.info);
				obj = obj.bindPopup(infowindow);
			}

			this.mapMarkers.push(obj);

		}

	},

	infowindowTemplate: function(info){
		var htmlContent = "";
		var jsonInfo;
		try {
			(_.isObject(info)) ? jsonInfo = info : jsonInfo = JSON.parse(info);
		}catch(err) {}
		if(jsonInfo && isNaN(info)){
			Object.entries(jsonInfo).forEach(function(entry){
				htmlContent += "<strong>"+ entry[0] +"</strong> "+ entry[1] +"</br>";
			})
		} else {
			htmlContent += info +"</br>";
		}
		return "<div class='junarinfowindow'>" + htmlContent + "</div>";
	},

	/**
	 * Crea clusters de puntos
	 */
	createMapClusters: function(){
		var self = this;
		_.each(this.model.data.get('clusters'), this.createMapCluster, this);
	},

	/**
	 * Crea un cluster de puntos 
	 * @param  {object} cluster
	 * @param  {int} index
	 */
	createMapCluster: function (cluster, index) {

		var clusterStyleIndex = this.calculateClusterPosition(parseInt(cluster.size), this.mapClustersStyles.length),
			clusterStyle = this.mapClustersStyles[clusterStyleIndex],
			clusterTemplate = '<div class="cluster-img '+clusterStyle.class+'">'+cluster.size+'</div>';

		var markerOptions = {
			icon: L.divIcon({
				className: 'cluster-icon',
				html: clusterTemplate,
				iconSize: [clusterStyle.width, clusterStyle.height],
			}),
		};

		// Add to heatmap
		this.addHeatmapFeature(cluster);

		var obj = L.marker(new L.LatLng(parseFloat(cluster.lat), parseFloat(cluster.long)), markerOptions);
		this.mapClusters.push(obj);

	},

	/**
	 * Create map clusters styles
	 */
	createMapClustersStyles: function(){
		
		// Si ya esta creada, return
		if (this.mapClustersStyles.length > 0) {
			return;
		}

		// Iterar para crear los estilos de los clusters
		for (var i = 0; i < this.mapClustersSizes.length; i++) {
			this.mapClustersStyles.push({
				class: 'm' + (i+1),
				height: this.mapClustersSizes[i],
				width: this.mapClustersSizes[i]
			});

		}

	},

	/**
	 *  The function for calculating the cluster icon image.
	 *
	 *  @param {number} count The count of markers in the clusterer.
	 *  @param {number} numStyles The number of styles available.
	 *  @return {number} index  The position of the style
	 */
	calculateClusterPosition: function(count, numStyles) {
		var index = 0;
		var dv = count;
		while (dv !== 0) {
			dv = parseInt(dv / 10, 10);
			index++;
		}
		index = Math.min(index, numStyles);
		return index;
	},

	/**
	 * Triggered when mapInstance receives a click
	 */
	onMapClickEvent: function(e){

		var eTarget = e.originalEvent.target;

		// If is a cluster
		if( 
			$(eTarget).hasClass('cluster-img') || 
			$(eTarget).hasClass('cluster-icon') 
		){
			var lat = e.latlng.lat,
				lng = e.latlng.lng,
				zoom = this.mapInstance.getZoom(),
				nextZoom = zoom + 1;
				maxZoom = this.mapInstance.getMaxZoom();

			if( nextZoom <= maxZoom ){
				this.mapInstance.flyTo([lat,lng],nextZoom);
			}
		}
	
	},

	/**
	 * Get the boundaries of the current map
	 */
	handleBoundChanges: function(e){

		var canContinue = true;
		if(e.type == 'moveend' && this.isPopupOpened){
			var canContinue = false;
		}

		if(this.mapInstance && canContinue){

			var center = this.mapInstance.getCenter(),
				bounds = this.mapInstance.getBounds(),
				zoom = this.mapInstance.getZoom();

			var updatedOptions = {
				zoom: zoom
			};

			if(bounds){
				updatedOptions.bounds = [
						bounds._northEast.lat, 
						bounds._northEast.lng, 
						bounds._southWest.lat, 
						bounds._southWest.lng
				];
			}

			if(center){
				updatedOptions.center = {
					lat: center.lat,
					long: center.lng,
				};
			}

			// Update options
			this.model.set('options', updatedOptions);

			// Go fetch new data
			this.model.data.fetch();

		}else{
			this.isPopupOpened = false;
		}

	},

	/**
	 * Convierte estilos de tipo kml al necesario para usar en los mapas
	 * @param  {object} styles
	 * @return {object}
	 */
	parseKmlStyles: function (styles) {
		var parsedStyles = _.clone(this.stylesDefault);

		if (_.isUndefined(styles)) {
			return parsedStyles;
		}
		if(styles.lineStyle){
			parsedStyles.lineStyle = this.kmlStyleToLine(styles.lineStyle);
		}
		if(styles.polyStyle){
			parsedStyles.polyStyle = this.kmlStyleToPolygon(parsedStyles.lineStyle, styles.polyStyle);
		}

		return parsedStyles;
	},

	/**
	 * Parser para los estilos desde un kml a lineas de google maps
	 * @param  {object} lineStyle
	 * @return {object
	 */
	kmlStyleToLine: function(lineStyle) {
		var defaultStyle = _.clone(this.stylesDefault.lineStyle);
		return {
			"strokeColor": this.getStyleFromKml(lineStyle, 'color', 'color', defaultStyle.strokeColor),
			"strokeOpacity": this.getStyleFromKml(lineStyle, 'color', 'opacity', defaultStyle.strokeOpacity),
			"strokeWeight": this.getStyleFromKml(lineStyle, 'width', 'width', defaultStyle.strokeWeight)
		};
	},

	/**
	 * Parser para los estilos de un kml a polygons de google maps
	 * @param  {object} lineStyle
	 * @param  {object} polyStyle
	 * @return {object}
	 */
	kmlStyleToPolygon: function (lineStyle, polyStyle) {
		var defaultStyle = _.clone(this.stylesDefault.polyStyle);

		return {
			"strokeColor": lineStyle.strokeColor,
			"strokeOpacity": lineStyle.strokeOpacity,
			"strokeWeight": lineStyle.strokeWeight,
			"fillColor": this.getStyleFromKml(polyStyle, 'color', 'color', defaultStyle.fillColor),
			"fillOpacity": this.getStyleFromKml(polyStyle, 'color', 'opacity', defaultStyle.fillOpacity)
		};
	},

	/**
	 * Obtiene un estilo de un objeto de estilos Kml para ser usado en google maps
	 * @param  {object} kmlStyles
	 * @param  {string} attribute
	 * @param  {string} type
	 * @param  {string} defaultStyle
	 * @return {string}
	 */
	getStyleFromKml: function (kmlStyles, attribute, type, defaultStyle) {
		var style = kmlStyles[attribute] || null;
		if(style == null) return defaultStyle;
		//Convierte el color de formato ARGB a RGB
		if(type == 'color') {
			return '#' + style.substring(2);
		}
		//La opacidad se extrae del color y convierte de hexadecimal a entero
		if(type == 'opacity') {
			return parseInt(style.substring(0, 2), 16) / 256;
		}

		if(type == 'width') {
			var value = parseFloat(style);
			return (value === 0)? 1 : value;
		}

		return style;
	},

	// Toggle heatmap and render
	toggleHeatMap: function(){
		if( this.onHeatMap ){
			this.onHeatMap = false;
		}else{
			this.onHeatMap = true;
		}
		this.render(); 
	},

	// Add heatmap feature
	addHeatmapFeature: function(obj) {
		//intensity = obj.intensity || 1;
		intensity = 1;
		this.heatMapFeatures.push([obj.lat, obj.long, intensity]);
	},

	// Remove leaflet events
	removeDanglingEvents: function(inputObj, checkPrefix, dom){
		if(inputObj !== null){
			//Taken from the leaflet sourcecode directly, you can search for these constants and see how those events are attached, why they are never fully removed i don't know
			var msPointer = L.Browser.msPointer,
			POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown',
			POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove',
			POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup',
			POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';

			for(var prop in inputObj){

				//if we are in the _leaflet_events state kill everything, else only stuff that contains the string '_leaflet_'
				var prefixOk = checkPrefix ? prop.indexOf('_leaflet_') !== -1 : true, propVal; 
				
				if(inputObj.hasOwnProperty(prop) && prefixOk){
					
					//Map the names of the props to the events that were really attached => touchstart equals POINTER_DOWN etc
					var evt = []; 
					//indexOf because the prop names are really weird 'touchstarttouchstart36' etc
					if(prop.indexOf('touchstart') !== -1){ 
						evt = [POINTER_DOWN];
					}else if(prop.indexOf('touchmove') !== -1){
						evt = [POINTER_MOVE];
					}else if(prop.indexOf('touchend') !== -1){
						evt = [POINTER_UP, POINTER_CANCEL];
					}

					propVal = inputObj[prop];
					if(evt.length > 0 && typeof propVal === 'function'){
						_.each(evt,function(domEvent){
							dom.removeEventListener(domEvent, propVal, false);
						});                    
					}

					//Reference B-GONE, Garbage b collected.
					inputObj[prop] = null;
					delete inputObj[prop];
				}
			}
		}        
	}

});
