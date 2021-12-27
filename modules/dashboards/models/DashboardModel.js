var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.DashboardModel = Backbone.Model.extend({

	url: '/dashboards',

	defaults:{
		title: '',
		description: '',
		category_id: '',
		notes: '',
		featured_dashboard: false,
		show_related: false,
		htmlCount: 0,
		resourceListCount: 0,
		individualResourceCount: 0,
		mobile: false
	},

	initialize: function(options){

		this.retryConfig = options.retryConfig;
		this.widgets = new Dashboards.collections.WidgetCollection();

		_.forEach(options.widgets,function(data){
			if(data.resource_type == "html"){
				this.addHTMLBlock(data);
			} else if (data.resource_type == "RESOURCE_LIST"){
				this.addResourceList(data);
			} else if (data.resource_type == "INDIVIDUAL_RESOURCE"){
				this.addIndividualResource(data);
			} else {
				this.widgets.add(new Dashboards.models.WidgetModel(_.extend(data, {retryConfig: _.clone(this.retryConfig)})));
			}
		}.bind(this));

		this.tags = new Dashboards.collections.TagsCollection();

		_.forEach(options.tags,function(data){
			var model = new this.tags.model({
				tag__name: data.name
			});
			if(model.isValid(true)){
				this.tags.add(model.toJSON());
			}
		}.bind(this));

	},

	addHTMLBlock: function(data){
		data.resource_id = this.getHTMLCount();
		data.resource_type = 'html';
		var resource = new Dashboards.models.ResourceModel(data);
		this.addResource(resource);
	},

	getHTMLCount: function(){
		var resp = this.get('htmlCount');
		this.set('htmlCount',resp+1);
		return resp;
	},

	addResourceList: function(data){
		data.resource_id = this.getResourceListCount();
		data.resource_type = 'RESOURCES_LIST';
		var resource = new Dashboards.models.ResourceModel(data);
		this.addResource(resource);
	},

	getResourceListCount: function(){
		var resp = this.get('resourceListCount');
		this.set('resourceListCount',resp+1);
		return resp;
	},

	addIndividualResource: function(data){
		data.resource_id = this.getIndividualResourceCount();
		data.resource_type = 'INDIVIDUAL_RESOURCE';
		var resource = new Dashboards.models.ResourceModel(data);
		this.addResource(resource);
	},

	getIndividualResourceCount: function(){
		var resp = this.get('individualResourceCount');
		this.set('individualResourceCount',resp+1);
		return resp;
	},

	addResource: function(resource){
			this.addWidget(resource);
	},

	removeResource: function(resource){
			this.removeWidget(resource);
	},

	updateWidgetsData: function(newData){
		var that = this;
		_.forEach(newData,function(data){
			var item = that.widgets.get(data.id);
			if(item){
				item.set('x', data.x ),
				item.set('y', data.y ),
				item.set('w', data.w ),
				item.set('h', data.h )
			}
		});
	},

	addWidget: function(data){
		var id = 'id-widget-'+data.createID();
		var item = this.widgets.get(id);
		if(!item){
			this.widgets.add(new Dashboards.models.WidgetModel(
				_.extend(data.toJSON(), {retryConfig: _.clone(this.retryConfig)})
			));
		}
	},

	removeWidget: function(data){
		this.removeWidgetById('id-widget-'+data.createID());
	},

	removeWidgetById: function(id){
		var item = this.widgets.get(id);
		if(item){
			this.widgets.remove(item);
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
							// console.log(response);
							return response;
					} else {
							// console.error(response);
					}
			});
	},

	getSettings: function(){
		var widgetsObjs = {};

		this.widgets.sort();

		this.widgets.each(function(e,i){
			var params = [];
			_.forEach(e.resource.get('parameters'),function(p){
				params.push('pArgument'+p.position+'='+p.value);
			});

			widgetsObjs['widgets-'+i+'-x'] = e.get('x');
			widgetsObjs['widgets-'+i+'-y'] = e.get('y');
			widgetsObjs['widgets-'+i+'-w'] = e.get('w');
			widgetsObjs['widgets-'+i+'-h'] = e.get('h');
			widgetsObjs['widgets-'+i+'-resource_type'] = e.resource.get('resource_type');
			if(e.resource.get('resource_type')!='html'){
				widgetsObjs['widgets-'+i+'-resource_id'] = e.resource.get('resource_id');
			}
			widgetsObjs['widgets-'+i+'-html'] = e.resource.get('html');
			widgetsObjs['widgets-'+i+'-order'] = i;
			widgetsObjs['widgets-'+i+'-parameters'] = params.join('&');

			if(e.resource.get('resource_type') == 'RESOURCES_LIST'){
				widgetsObjs['widgets-'+i+'-list_name'] = e.resource.get('list_name');
				widgetsObjs['widgets-'+i+'-list_name_color'] = e.resource.get('list_name_color');
				widgetsObjs['widgets-'+i+'-links_color'] = e.resource.get('links_color');
				widgetsObjs['widgets-'+i+'-title_blocks-TOTAL_FORMS'] = e.resource.get("title_blocks").length;
				widgetsObjs['widgets-'+i+'-title_blocks-INITIAL_FORMS'] = 0;
				widgetsObjs['widgets-'+i+'-title_blocks-MAX_NUM_FORMS'] = '';
				_.forEach(e.resource.get("title_blocks").models, function(tb,j){
					widgetsObjs['widgets-'+i+'-title_blocks-'+j+'-order'] = j;
					widgetsObjs['widgets-'+i+'-title_blocks-'+j+'-htmlContent'] = tb.get("htmlContent");
					widgetsObjs['widgets-'+i+'-title_blocks-'+j+'-backgroundColor'] = tb.get("backgroundColor");
					widgetsObjs['widgets-'+i+'-title_blocks-'+j+'-borderColor'] = tb.get("borderColor");
					widgetsObjs['widgets-'+i+'-title_blocks-'+j+'-borderWidth'] = tb.get("borderWidth");
				});
				widgetsObjs['widgets-'+i+'-resources_list-TOTAL_FORMS'] = e.resource.get("resources_list").length;
				widgetsObjs['widgets-'+i+'-resources_list-INITIAL_FORMS'] = 0;
				widgetsObjs['widgets-'+i+'-resources_list-MAX_NUM_FORMS'] = '';
				_.forEach(e.resource.get("resources_list").models, function(rlr,j){
					widgetsObjs['widgets-'+i+'-resources_list-'+j+'-order'] = j;
					widgetsObjs['widgets-'+i+'-resources_list-'+j+'-resource_id'] = rlr.get("resource_id");
					widgetsObjs['widgets-'+i+'-resources_list-'+j+'-resource_name'] = rlr.get("resource_name");
					widgetsObjs['widgets-'+i+'-resources_list-'+j+'-direct_download'] = rlr.get("direct_download");
					widgetsObjs['widgets-'+i+'-resources_list-'+j+'-hide_icon'] = rlr.get("hide_icon");
				});
			} else if (e.resource.get('resource_type') == 'INDIVIDUAL_RESOURCE'){
				widgetsObjs['widgets-'+i+'-gradient_begin_color'] = e.resource.get('gradient_begin_color');
				widgetsObjs['widgets-'+i+'-gradient_end_color'] = e.resource.get('gradient_end_color');
				widgetsObjs['widgets-'+i+'-gradient_type'] = e.resource.get('gradient_type');
				widgetsObjs['widgets-'+i+'-resource_id'] = e.resource.get('selected_resource').get("resource_id");
				widgetsObjs['widgets-'+i+'-resource_name'] = e.resource.get('selected_resource').get("resource_name");
				widgetsObjs['widgets-'+i+'-text_color'] = e.resource.get('selected_resource').get("text_color");
				widgetsObjs['widgets-'+i+'-text_size'] = e.resource.get('selected_resource').get("text_size");
				widgetsObjs['widgets-'+i+'-direct_download'] = e.resource.get('selected_resource').get("direct_download");
			}
		});

		var tagsObj = {};
		this.tags.each(function(e,i){
			tagsObj['tags-'+i+'-name'] = e.get('tag__name');
		});

		var extraParams = _.extend(widgetsObjs,tagsObj);

		return _.extend(
			{
				title: 			this.get('title'),
				description: 	this.get('description'),
				category: 		this.get('category_id'),
				notes: 			this.get('notes'),
				show_related: 	this.get('show_related'),
				featured_dashboard: this.get('featured_dashboard'),
				'widgets-TOTAL_FORMS':   this.widgets.length,
				'widgets-INITIAL_FORMS': 0,
				'widgets-MAX_NUM_FORMS': '',
				'tags-TOTAL_FORMS':   this.tags.length,
				'tags-INITIAL_FORMS': 0,
				'tags-MAX_NUM_FORMS': ''
			},
			extraParams
		);
	},

	validateMetadata: function(){
				var validTitle = !_.isEmpty(this.get('title')),
						validDescription = !_.isEmpty(this.get('description')),
						validCategory = !_.isEmpty(""+this.get('category_id'));

				return {
					valid: (  validTitle &&  validDescription && validCategory ),
					fields:{
						'title':  !validTitle,
						'description':  !validDescription,
						'category':  !validCategory
					}
				};
		},

		remove: function (options) {
		var opts = _.extend({url: '/dashboards/remove/' + this.id}, options || {});

		return Backbone.Model.prototype.destroy.call(this, opts);
	},

	remove_revision: function (options) {
		var opts = _.extend({url: '/dashboards/remove/revision/' + this.id}, options || {});

		return Backbone.Model.prototype.destroy.call(this, opts);
	}

});
