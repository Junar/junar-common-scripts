var Dashboards = Dashboards || {models:{},views:{},collections:{}};

Dashboards.views.GridStackIRItemView = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(Dashboards.views.GridStackIRItemView.prototype, Backbone.Epoxy.View.prototype, {

  	initialize: function (options) {
        this.template = _.template($('#individual-resource-widget').html());
        this.model = options.model;
        this.listenTo(this.model, "change", this.render, this);
        this.render();
    },

    showLoading: function(){
        $(this.el).find('.loading').show();
    },

    hideLoading: function(){
        $(this.el).find('.loading').hide();
    },

    render: function(){
        this.showLoading();
        var url = (this.model.get("selected_resource")) ? this.model.get("selected_resource").get("url") : "#";
        var background = '';

        if (this.model.get("file_data")){
            background = "url(" + this.model.get("file_data") + ")";
        } else {
            var gradientOrientation= " ";
            if (this.model.get("gradient_type") == "HORIZONTAL"){
                gradientOrientation = "to right";
            } else if (this.model.get("gradient_type") == "VERTICAL"){
                gradientOrientation = "to bottom";
            }
            background = "linear-gradient("+ gradientOrientation +", "+ this.model.get("gradient_begin_color") +", "+ this.model.get("gradient_end_color") +")";
        }

        $(this.el).find('.render-area').html(this.template({
            html: this.model.get("html"),
            resource: this.model.get("selected_resource"),
            background: background,
            url: url
        }));
        this.hideLoading();
        OverlayScrollbars($(this.el).find('.custom-scrollbar')[0], {scrollbars: {autoHide: 'move'} });
    }

});

Dashboards.views.GridStackIRItemView.extend = Backbone.Epoxy.View.extend;