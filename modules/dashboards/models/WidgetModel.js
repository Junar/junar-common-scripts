var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.WidgetModel = Backbone.Model.extend({

    initialize: function(options){

        this.retryConfig = (options.retryConfig) ? options.retryConfig : {};

        this.set('auto_position',(options.w)?false:true);

    	this.set('x',(options.x)?options.x:0);
    	this.set('y',(options.y)?options.y:0);
    	this.set('w',(options.w)?options.w:4);
    	this.set('h',(options.h)?options.h:4);
        this.styleDefault = options.styleDefault;

        this.resource = new Dashboards.models.ResourceModel(options);

        this.updateId();

        this.renderEl = '#'+this.get('id');

        if(options.tooltip){
            this.renderEl = this.renderEl+'-tooltip';
        }

  	},

    updateId: function(){
      this.set('id','id-widget-'+this.resource.createID());
    },

    render: function(){

      if(this.resource.get('resource_type')=='vz'){

        var impl_details = _.extend( this.resource.get('impl_details'), {
          parameters: this.resource.get('parameters')
        } );

        var vzType = this.resource.get('type');

        if(_.isUndefined(vzType)){
          vzType = $.parseJSON( this.resource.get('impl_details') ).format.type;
        }

        this.renderItemView = new Dashboards.views.GridStackVzItemView({
          id:   this.resource.get('revision_id'),
          type: vzType,
          lib:  this.resource.get('lib'),
          el:   this.renderEl,
          impl_details: this.resource.get('impl_details'),
          parameters: this.resource.get('parameters'),
          styleDefault: this.styleDefault,
          retryConfig: this.retryConfig
        });

      } else if(this.resource.get('resource_type')=='ds'){
        
        this.renderItemView = new Dashboards.views.GridStackDsItemView({
          id:   this.resource.get('revision_id'),
          el:   this.renderEl,
          parameters: this.resource.get('parameters'),
          resource: this.resource,
          retryConfig: this.retryConfig
        });
      
      } else if(this.resource.get('resource_type')=='html'){

        this.renderItemView = new Dashboards.views.GridStackHtmlItemView({
          id:   this.resource.get('revision_id'),
          el:   this.renderEl,
          html: this.resource.get('html')
        });
      
      } else if(this.resource.get('resource_type')=='RESOURCES_LIST'){

        this.renderItemView = new Dashboards.views.GridStackRLItemView({
          id:   this.resource.get('revision_id'),
          el:   this.renderEl,
          model: this.resource
        });
      
      } else if(this.resource.get('resource_type')=='INDIVIDUAL_RESOURCE'){

        this.renderItemView = new Dashboards.views.GridStackIRItemView({
          id:   this.resource.get('revision_id'),
          el:   this.renderEl,
          model: this.resource
        });
      }
    },

  	toJSON: function(){
  		var that = this;
  		return _.extend({
  			id: that.get('id'),
  			x: that.get('x'),
  			y: that.get('y'),
  			w: that.get('w'),
        h: that.get('h'),
  			auto_position: that.get('auto_position'),
  		},{
  			resource: this.resource.toJSON()
  		});
  	}

});
