var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.ResourceListModel = Backbone.Model.extend({
    
    defaults: {
        list_name:'',
        list_name_color: '#000000',
        links_color: '#0645AD',
        title_blocks: [],
        resources_list: []
    }

});