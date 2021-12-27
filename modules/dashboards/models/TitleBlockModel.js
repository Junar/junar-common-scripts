var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.TitleBlockModel = Backbone.Model.extend({
    
    defaults: {
        htmlContent: '',
        backgroundColor: 'FFFFFF',
        borderWidth: 1,
        borderColor: '000000',
    },

    reset: function () {
        this.clear({silent: true});
        this.set(this.defaults);
    }
});