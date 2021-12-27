var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.collections.ResourceCollection = Backbone.Collection.extend({

	//default
	model: Dashboards.models.ResourceModel,
	_url: '/rest/resources.json',
	
	initialize: function(options){
	},

	fetchResources: function(filters){
		this.url = this._url+'?'+$.param(filters);
		var that = this;
		this.fetch({
            reset: true,
            success: function (collection, response, options) {
                that.trigger('fetch.success');
            },
            error: function (collection, response, options) {
                // you can pass additional options to the event you trigger here as well
                //self.trigger('errorOnFetch');
            }
        });
	}

});