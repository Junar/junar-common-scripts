var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.collections.WidgetCollection = Backbone.Collection.extend({

	model: Dashboards.models.WidgetModel,

	comparator: function (a, b) {
	      var diff = a.get('y') - b.get('y');
	      if (diff === 0) {
	          return a.get('x') < b.get('x') ? -1 : 1;
	        }

	      return diff;
	  }

});