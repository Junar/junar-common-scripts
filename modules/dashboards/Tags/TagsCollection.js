var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.collections.TagsCollection = Backbone.Collection.extend({
    model: Dashboards.models.TagsModel,
});