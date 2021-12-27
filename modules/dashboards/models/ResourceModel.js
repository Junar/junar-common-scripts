String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash; // Convert to 32bit integer
    }
    return hash;
};

var Dashboards = Dashboards || { models: {}, views: {}, collections: {} };
Dashboards.models.ResourceModel = Backbone.Model.extend({

    initialize(options) {
	    this.retryConfig = options.retryConfig;
        // si hay parametros de visualizacion no hay parametros en el widget
        if (options.visualization_parameters) {
            const params = _.map(options.visualization_parameters, (parameter, key, list) => `pArgument${parameter.position}=${parameter.default}`);
            this.set('export_parameters', params.join('&'));
        } else {
            this.set('export_parameters', options.widget_parameters);
        }

        if (options.widget_parameters) {
            options.widget_parameters = this.getQueryParams(options.widget_parameters);
        }

        // llegan params cargados
        if (options.widget_parameters && _.keys(options.widget_parameters).length > 0) {
            if (options.datastream_parameters && options.datastream_parameters.length > 0 && options.datastream_parameters.length == _.keys(options.widget_parameters).length) {
                options.parameters = [];
                _.forEach(options.datastream_parameters, (v, k) => {
                    options.parameters[v.position] = _.extend(v, {
                        value: options.widget_parameters[`pArgument${v.position}`],
                    });
                });
            }
            if (options.visualization_parameters && options.visualization_parameters.length > 0 && options.visualization_parameters.length == _.keys(options.widget_parameters).length) {
                options.parameters = [];
                _.forEach(options.visualization_parameters, (v, k) => {
                    options.parameters[v.position] = _.extend(v, {
                        value: options.widget_parameters[`pArgument${v.position}`],
                    });
                });
            }
        } else if (!options.parameters) {
            options.parameters = [];
        }

        options.lib = (!options.lib || options.lib == '') ? 'd3' : options.lib;
        options.type = (!options.type || options.type == '') ? 'linechart' : options.type;

        this.set('hasParams', (options.parameters && options.parameters.length > 0));

        if (this.get('hasParams')) {
            paramsID = '-';
            const parameters = _.map(options.parameters, (e) => {
                if (!e.value) {
                    e.value = e.default;
                }
                return e;
            });
            this.set('parameters', parameters);
        }

        if (options.resource_type == 'RESOURCES_LIST' && typeof options.title_blocks !== 'undefined' && typeof options.title_blocks[0] !== 'undefined') {
            const titleBLocksCollection = new Dashboards.collections.TitleBlockCollection();
            _.each(options.title_blocks, (title_block) => {
                const parsedTitleBlock = new Dashboards.models.TitleBlockModel({
                    order: title_block.order,
                    htmlContent: title_block.htmlContent,
                    backgroundColor: title_block.backgroundColor,
                    borderColor: title_block.borderColor,
                    borderWidth: title_block.borderWidth,
                });
                titleBLocksCollection.add(parsedTitleBlock);
            });
            this.set('title_blocks', titleBLocksCollection);
        }

        if (options.resource_type == 'RESOURCES_LIST' && typeof options.resources_list !== 'undefined' && typeof options.resources_list[0] !== 'undefined') {
            const resourceCollection = new Dashboards.collections.ResourceCollection();
            _.each(options.resources_list, (resource) => {
                const parsedResource = new Dashboards.models.ResourceModel({
                    order: resource.order,
                    revision_id: resource.revision_id,
                    resource_id: resource.resource_id,
                    resource_type: resource.resource_type,
                    title: resource.title,
                    resource_name: resource.resource_name,
                    impl_type: resource.impl_type,
                    direct_download: resource.direct_download,
                    hide_icon: resource.dataset_type,
                    url: resource.url,
                });
                resourceCollection.add(parsedResource);
            });
            this.set('resources_list', resourceCollection);
        }

        if (options.resource_type == 'INDIVIDUAL_RESOURCE' && typeof options.selected_resource !== 'undefined' && typeof options.selected_resource.cid === 'undefined') {
            const parsedResource = new Dashboards.models.ResourceModel({
                resource_id: options.selected_resource.resource_id,
                resource_type: options.selected_resource.resource_type,
                title: options.selected_resource.title,
                resource_name: options.selected_resource.resource_name,
                direct_download: options.selected_resource.direct_download,
                url: options.selected_resource.url,
                text_color: options.selected_resource.text_color,
                text_size: options.selected_resource.text_size,
            });
            this.set('selected_resource', parsedResource);
        }

        // set ID
        this.updateId();
  	},

    updateId() {
        this.set('id', `id-resource-${this.createID()}`);
    },

    createID() {
        const paramsID = [];
        if (this.get('hasParams')) {
            paramsID.push('');
            _.forEach(this.get('parameters'), (e) => {
                paramsID.push(`parameter${e.position}-${e.value.hashCode()}`);
            });
        }
        return `${this.get('resource_type')}-${this.get('resource_id')}${paramsID.join('-')}`;
    },

  	updateParams(newParams) {
  		this.set('parameters', newParams);
        this.setQueryParams(newParams);
        this.updateId();
  	},

    updateHtml(html) {
        this.set('html', html);
    },

    setQueryParams(parameters) {
        const params = _.map(parameters, (parameter, key, list) => `pArgument${parameter.position}=${parameter.value}`);
        this.set('widget_parameters', params.join('&'));
    },

    getQueryParams(queryString) {
        const query = queryString;
        if (!query) {
            return false;
        }
        return _
            .chain(query.split('&'))
            .map((params) => {
                const p = params.split('=');
                try {
                    return [p[0], decodeURIComponent(p[1])];
                } catch (err) {
                    return [p[0], p[1]];
                }
            })
            .object()
            .value();
    },

});
