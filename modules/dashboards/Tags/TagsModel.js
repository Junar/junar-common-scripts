var Dashboards = Dashboards || {models:{},views:{},collections:{}};
Dashboards.models.TagsModel = Backbone.Model.extend({
    defaults: {
        tag__name: undefined
    },

    validation: {
        tag__name: {
                maxLength: 40,
                msg: (Configuration.language == 'es') ? 'El nombre de usuario no debe superar los ' : 'This field supports up to ' + ' 40 ' + (Configuration.language == 'es') ? ' caracteres.' : ' characters.'
            }
    }
});