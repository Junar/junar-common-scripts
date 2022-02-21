var Dashboards = Dashboards || {models:{},views:{},collections:{}};

Dashboards.views.GridStackVzItemView = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(Dashboards.views.GridStackVzItemView.prototype, Backbone.Epoxy.View.prototype, {

		enteredScreen: false,

		initialize: function (options) {

    		this.retryConfig = options.retryConfig;

			// Set mapOptions from Configuration, of not set it empty
			this.mapOptions = Configuration.mapOptions || {};

			// Cuando se crea un DB el impl_details viene como string, no se porque. Lo convierto a Objeto JSON.
			if( !_.isUndefined(options) ){
				if( !_.isUndefined(options.impl_details) ){
					if( _.isString(options.impl_details) ){
						var parsedImplDetails = $.parseJSON( options.impl_details );
						if( !_.isNull( parsedImplDetails ) ){
							options.impl_details = parsedImplDetails;
						}
					}
				}
			}

			this.renderModel = new charts.models.Chart(options);

			if(options.impl_details){
				this.renderModel.parse(_.extend(options.impl_details,{
						revision_id:options.id,
						styleDefault: Configuration.mapStyleDefault
					})
				);
			}

			this.listenTo(this.renderModel, 'change', this.showLoading, this)
			this.listenTo(this.renderModel, 'data_updated',this.onChangeData,this);
			
			if(this.renderModel.data.get('type') == 'mapchart'){
				this.listenTo(this.renderModel.data, 'fetch:start', this.showMapLoading, this);
				this.listenTo(this.renderModel.data, 'fetch:end', this.hideMapLoading, this);
			}

			this.chartsFactory = new charts.ChartsFactory();
			var chartSettings = this.chartsFactory.create(options.type,options.lib);
			if(chartSettings){
				this.ChartViewClass = chartSettings.Class;
			}
			this.renderModel.bindDataModel();

			document.addEventListener('scroll', this.checkPosition.bind(this));
      		this.checkPosition();
			return this;
		},

		checkPosition: function(){
			// render widget only if it is in screen
			if(!this.enteredScreen){
				var documentPosition = $(document).scrollTop() + $(window).height();
				var widgetPosition = this.$el.offset().top;
				if(widgetPosition < documentPosition){
					this.enteredScreen = true;
					this.fetchData(0);
				}
			}
		},

		setTimestamp: function(){

			if( 
				!_.isUndefined( this.chartInstance ) &&
				!_.isUndefined( this.chartInstance.model ) &&
				!_.isUndefined( this.chartInstance.model.get('el') )
			){

				var timeID = this.chartInstance.model.get('el');
				timeID = timeID.split('#');

				timeID = '#tooltip-time-'+timeID[1];

				var timestamp;

				// For Maps
				if( 
					!_.isUndefined( this.chartInstance.model.data ) &&
					!_.isUndefined( this.chartInstance.model.data.get('type') ) &&
					this.chartInstance.model.data.get('type') == 'mapchart' &&
					!_.isUndefined( this.chartInstance.model.data.get('timestamp') )
				){

					timestamp = this.chartInstance.model.data.get('timestamp');

				// For Charts
				}else if(
					$(timeID).length > 0 &&
					!_.isUndefined( this.chartInstance ) &&
					!_.isUndefined( this.chartInstance.model ) &&
					!_.isUndefined( this.chartInstance.model.data ) &&
					!_.isUndefined( this.chartInstance.model.data.get('response') ) &&
					!_.isUndefined( this.chartInstance.model.data.get('response').timestamp )          
				){

					timestamp = this.chartInstance.model.data.get('response').timestamp;

				}

				// If timestamp exists, then proceed
				if( 
					!_.isUndefined( timestamp )
				){

					var dFormat = 'MMMM DD, Y',
						tFormat = 'hh:mm A',
						dt,
						timeText = $(timeID).find('li > div').html();

					if( !_.isUndefined( timeText ) ){

						if( timeText.indexOf('has-timestamp') != -1  ){

							timeText = $(timeID).find('li > div > .has-modified-at').html();
						
						}

						// sometimes are seconds, sometimes milliseconds
						if(timestamp < 100000000000){
							timestamp = timestamp * 1000; 
						}

						// Get locale from lang attribute un <html>
						var local = $('html').attr('lang');

						// If spanish
						if(local === "es" || local.indexOf("es-") != -1 || local.indexOf("es_") != -1){
							local = "es";
						// else englishs
						}else{
							//(?) if I use "en" doesn't work, I must use "" for "en"
							local = "";
						}

						if( timestamp == 0 ){
							dt = new moment().locale(local)
						}else{
							dt = new moment(timestamp).locale(local);
						}

						dateFormatted = dt.format(dFormat)

						timeFormatted = dt.format(tFormat)

						timestamp = dateFormatted + ', ' + timeFormatted;
						
						// Render time text with modified at and timestamp
						$(timeID).find('li > div').html('<span class="has-modified-at">'+timeText+'</span><br><br>'+(Configuration.language == 'es') ? 'Última actualización' : 'Latest update'+'<br><span style="text-transform:capitalize;" class="has-timestamp">'+timestamp+'</span>');

					}

				}

			}

		},

		fetchData: function(retryCount){
			(typeof retryCount === "undefined") ? retryCount = 0 : '';

			this.showLoading();
			this.renderModel.data.fetch()
				.done(function () {
					this.hideLoading();
				}.bind(this))
				.fail(function(response){
					var responseJSON;
					try{ responseJSON = JSON.parse(response.responseText); } catch {}
					if(responseJSON && responseJSON.status == 408 && retryCount < this.retryConfig.retryLimit){
						this.$(".loading .retrying.text").show();
						// reintentamos
						setTimeout(function(){
							this.fetchData(++retryCount);
						}.bind(this), this.retryConfig.retryDelay);
					} else {
						this.hideLoading();
					}
				}.bind(this));
		},

		onChangeData: function () {
			this.setTimestamp();
			this.render();
			this.hideLoading();
		},

		showLoading: function(){
			$(this.el).find('.loading').show();
		},

		hideLoading: function(){
			$(this.el).find('.loading').hide();
		},

		showMapLoading: function(){
			$(this.el).find('#id_miniLoading').show();
		},

		hideMapLoading: function(){
			$(this.el).find('#id_miniLoading').hide();
		},

		render: function(){

			if (this.ChartViewClass) {

				if(this.chartInstance){
					this.chartInstance.destroy();
				}

				this.chartInstance = new this.ChartViewClass({
					model: this.renderModel,
					el: $(this.el).find('.render-area'),
					mapOptions: this.mapOptions
				});
				
				if(this.renderModel.valid()){
						this.chartInstance.render();
				};
			}

		}

});

Dashboards.views.GridStackVzItemView.extend = Backbone.Epoxy.View.extend;
