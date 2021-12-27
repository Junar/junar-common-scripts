var Dashboards = Dashboards || {models:{},views:{},collections:{}};

Dashboards.views.GridStackRLItemView = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(Dashboards.views.GridStackRLItemView.prototype, Backbone.Epoxy.View.prototype, {

  	initialize: function (options) {
        this.template = _.template($('#resource-list-widget').html());
        this.model = options.model;
        this.render();
    },

    showLoading: function(){
        $(this.el).find('.loading').show();
    },

    hideLoading: function(){
        $(this.el).find('.loading').hide();
    },

    render: function(){
        var that = this;
        this.showLoading();
        $(this.el).find('.render-area').html(this.template({
            list_name: this.model.get("list_name"),
            list_name_color: this.model.get("list_name_color"),
            links_color: this.model.get("links_color"),
            title_blocks: this.model.get("title_blocks").toJSON(),
            resources: this.model.get("resources_list").toJSON()
        }));
        this.hideLoading();
        OverlayScrollbars($(this.el).find('.custom-scrollbar')[0], {scrollbars: {autoHide: 'move'} });
    },

});

Dashboards.views.GridStackRLItemView.extend = Backbone.Epoxy.View.extend;