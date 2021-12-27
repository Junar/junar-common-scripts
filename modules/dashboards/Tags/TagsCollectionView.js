var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.views.TagsCollectionView = Backbone.View.extend({
    initialize: function (options) {
        this.template = _.template( $(options.templateID).html() );
        this.listenTo(this.collection, 'add change remove', this.render, this);
    },

    render: function () {
        this.$el.html(this.template({tags: this.collection.toJSON()}));
    }
});