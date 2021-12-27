var Dashboards = Dashboards || {models:{},views:{},collections:{}};

Dashboards.views.GridStackHtmlItemView = function(options) {
	this.inheritedEvents = [];

	Backbone.Epoxy.View.call(this, options);
}

_.extend(Dashboards.views.GridStackHtmlItemView.prototype, Backbone.Epoxy.View.prototype, {

  	initialize: function (options) {
      this.render(options.html);
      return this;
    },

    showLoading: function(){
      $(this.el).find('.loading').show();
    },

    hideLoading: function(){
      $(this.el).find('.loading').hide();
    },

    render: function(html){
      this.showLoading();
      $(this.el).find('.render-area').html(html);
      this.hideLoading();
      OverlayScrollbars($(this.el).find('.custom-scrollbar')[0], {scrollbars: {autoHide: 'move'} });
    }

});

Dashboards.views.GridStackHtmlItemView.extend = Backbone.Epoxy.View.extend;