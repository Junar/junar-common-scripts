var Dashboards = Dashboards || { models: {}, views: {}, collections: {} };

Dashboards.views.GridStackView = function (options) {
    this.inheritedEvents = [];

    Backbone.Epoxy.View.call(this, options);
};

_.extend(Dashboards.views.GridStackView.prototype, Backbone.Epoxy.View.prototype, {

    // Extend functions
    events: {
        'click .grid-stack-item-remove': 'onRemoveWidgetClicked',
        'click .grid-stack-item-edit': 'onEditWidgetClicked',
        'click .grid-stack-item-edit-html': 'onEditHtmlClicked',
        'click .grid-stack-item-duplicate-html': 'onDuplicateHtmlClicked',
        'click .grid-stack-item-edit-resource-list': 'onEditResourceListClicked',
        'click .grid-stack-item-duplicate-resource-list': 'onDuplicateResourceListClicked',
        'click .grid-stack-item-edit-individual-resource': 'onEditIndividualResourceClicked',
        'click .grid-stack-item-guid': 'onGuidClicked',
        'click .grid-stack-item-embed': 'onEmbedClicked',
        'click .grid-stack-item-csv': 'onExportCsvClicked',
        'click .grid-stack-item-xls': 'onExportXlsClicked',
        'click .grid-stack-item-json': 'onExportJsonClicked',
        'click .grid-stack-item-xml': 'onExportXmlClicked',
        'click .retryButton, #id_retryButton': 'onRetry',
    },

    initialize(options) {
        this.retryConfig = this.retryConfig;

        this.gridOptions = {
            cellHeight: 80,
            verticalMargin: 20,
            staticGrid: !!options.staticGrid,
            disableResize: ( !_.isUndefined(options.allowResize) ) ? !options.allowResize : true,
            disableDrag: ( !_.isUndefined(options.allowResize) ) ? !options.allowResize : true,
        };

        this.$el.gridstack(this.gridOptions);
        this.$grid = this.$el.data('gridstack');

        this.$el.on('change', this.onChange.bind(this));
        this.$el.on('dragstart', this.onDragStart.bind(this));
        this.$el.on('dragstop', this.onDragStop.bind(this));
        this.$el.on('resizestart', this.onResizesStart.bind(this));
        this.$el.on('resizestop', this.onResizeStop.bind(this));

        this.template = _.template($('#grid-item-template').html());
        this.paramsTemplate = _.template($('#grid-item-template-params').html());

        return this;
    },

    onChange(event, ui) {
        // console.log('onChange',event.target);
    },

    onDragStart(event, ui) {
        // console.log('onDragStart',event.target);
    },

    onDragStop(event, ui) {
        // console.log('onDragStop',event.target);
        const that = this;
        setTimeout(() => {
            that.syncGridWithModel();
        }, 1000);
    },

    onResizesStart(event, ui) {
        // console.log('onResizesStart',event.target);
    },

    onResizeStop(event, ui) {
        // console.log('onResizesStop',event.target);

        const that = this;

        setTimeout(() => {
            that.reRenderWidget(event, ui);
        }, 1);

        setTimeout(() => {
            that.syncGridWithModel();
        }, 1000);
    },

    syncGridWithModel() {
        this.model.updateWidgetsData(this.toJSON());
    },

    toJSON() {
        return _.map(this.$el.find('.grid-stack-item:visible'), (el) => {
            el = $(el);
            const id = el.attr('id');
            const node = el.data('_gridstack_node');
            return {
                id: el.attr('id'),
                x: node.x,
                y: node.y,
                w: node.width,
                h: node.height,
            };
        });
    },

    onEditWidgetClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.edit.params', { id, parameters: unItem.resource.get('parameters') });
    },

    onEditHtmlClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.edit.html', { id, html: unItem.resource.get('html') });
    },

    onDuplicateHtmlClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.duplicate.html', { id, html: unItem.resource.get('html') });
    },

    onEditResourceListClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.edit.resources_list', { resourceList: unItem.resource });
    },

    onDuplicateResourceListClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.duplicate.resources_list', { resourceList: unItem.resource });
    },

    onEditIndividualResourceClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.edit.individual_resource', { individualResource: unItem.resource });
    },

    onGuidClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.show.guid', { id, text: unItem.get('guid') });
    },

    onEmbedClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        this.trigger('widget.show.embed', { id, text: unItem.get('embedUrl'), params: unItem.get('widget_parameters') });
    },

    onExportCsvClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        $(`#id_tooltipOptions_${unItem.resource.id}`).fadeOut(375);
        window.location = `${unItem.get('csvUrl')}?${unItem.resource.get('export_parameters')}`;
    },

    onExportXlsClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        $(`#id_tooltipOptions_${unItem.resource.id}`).fadeOut(375);
        window.location = `${unItem.get('xlsUrl')}?${unItem.resource.get('export_parameters')}&applyFormat=1`;
    },

    onExportJsonClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        $(`#id_tooltipOptions_${unItem.resource.id}`).fadeOut(375);
        window.location = `${unItem.get('jsonUrl')}?${unItem.resource.get('export_parameters')}`;
    },

    onExportXmlClicked(e) {
        e.preventDefault();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        const unItem = this.model.widgets.get(id);
        $(`#id_tooltipOptions_${unItem.resource.id}`).fadeOut(375);
        window.location = `${unItem.get('xmlUrl')}?${unItem.resource.get('export_parameters')}`;
    },

    onRemoveWidgetClicked(e) {
        e.preventDefault();
        const obj = $(e.target).parents('.grid-stack-item');
        this.removeWidgetByObject(obj);
    },

    onRetry(e) {
        $(e.target).parents('.retry-later').hide();
        const id = $(e.target).parents('.grid-stack-item').attr('id');
        this.renderWidget(this.model.widgets.get(id));
    },

    removeWidgetByObject(obj) {
        this.$grid.removeWidget(obj, true);
        this.model.removeWidgetById(obj.attr('id'));
        this.trigger('widget.remove');
    },

    refresh(objId) {
        const that = this;
        setTimeout(() => {
            that.syncGridWithModel();
        });
        this.render();
    },

    destroy() {
        this.$grid.removeAll();
    },

    renderWidget(e) {
        const obj = e.toJSON();

        obj.staticGrid = this.gridOptions.staticGrid;
        const paramsHTML = this.paramsTemplate(obj);

        // create
        if (this.$el.find(`#${obj.id}`).length == 0) {
            // por alguna razón $(this.template(obj)); dejaba de funcionar a la tercera vez que se ejecutaba
            const template = this.template(obj);
            $unItem = $($('<div></div>').html(template).children());
            if (e.resource.get('hasParams')) {
                $unItem.find('.paramsContainer').html(paramsHTML);
            }

            this.$grid.addWidget($unItem, obj.x, obj.y, obj.w, obj.h, obj.auto_position);

            const renderArea = $unItem.find('.render-area.ds');
            if (renderArea.length) {
                renderArea.css('top', $unItem.find('.section-title').height());
            }
            e.set('auto_position', false);

            // update
        } else {
            if (e.resource.get('hasParams')) {
                this.$el.find(`#${obj.id}`).find('.paramsContainer').html(paramsHTML);
            }

            if (e.resource.get('resource_type') == 'html') {
                this.$el.find(`#${obj.id}`).find('textarea').val(e.resource.get('html'));
            }
        }

        if (e.get('resource_type') == 'vz') {
            // Need to destroy here, not working on to trigger destroy on GridStackVzItemView
            if (!_.isUndefined(e.renderItemView) && !_.isUndefined(e.renderItemView.chartInstance)) {
                e.renderItemView.chartInstance.destroy();
            }
        }

        e.render();
    },

    render() {
        let unItem;
        this.model.widgets.each(this.renderWidget, this);

        // remove
        const that = this;
        this.$el.find('.grid-stack-item').each((i, el) => {
            el = $(el);
            const id = el.attr('id');
            const unItem = that.model.widgets.get(id);
            if (!unItem) {
                that.removeWidgetByObject(el);
            }
        });

        return this;
    },

    getHeight(element) {
        let footerHeight = 0;

        if (!_.isUndefined(element.find('.footer'))) {
            if (element.find('.footer').length > 0) {
                footerHeight = element.find('.footer').outerHeight(true);
            }
        }

        const height = 			element.height()
			- element.find('.section-title').outerHeight(true)
			- footerHeight;

        return height;
    },

    reRenderWidget(event, ui) {
        const { id } = event.target;
        const element = this.$el.find(`#${id}`);
        const unItem = this.model.widgets.get(id);

        // If vz, destroy
        if (unItem.get('resource_type') == 'vz') {
            // Need to destroy here, not working on to trigger destroy on GridStackVzItemView
            if (!_.isUndefined(unItem.renderItemView) && !_.isUndefined(unItem.renderItemView.chartInstance)) {
                unItem.renderItemView.chartInstance.destroy();
            }
        }

        // If vz, render again
        if (unItem.get('resource_type') == 'vz') {
            // Render Viz
            unItem.render();
        }
    },

});

Dashboards.views.GridStackView.extend = Backbone.Epoxy.View.extend;
