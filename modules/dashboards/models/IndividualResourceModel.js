var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.IndividualResourceModel = Backbone.Model.extend({
    
    defaults: {
        html: '',
        gradient_begin_color: '#ffffff',
        gradient_end_color: '#ffffff',
        gradient_type: "HORIZONTAL",
        selected_resource: null
    }

});