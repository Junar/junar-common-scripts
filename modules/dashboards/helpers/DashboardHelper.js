var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.helper = {
    createId: function(type,model){
    	return 'id-'+type+'-'+model.get('resource_type')+'-'+model.get('resource_id');
    }
};