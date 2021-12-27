var Dashboards = Dashboards || { models: {}, views: {}, collections: {} };

Dashboards.views.GridStackDsItemView = function (options) {
    this.inheritedEvents = [];

    Backbone.Epoxy.View.call(this, options);
};

_.extend(Dashboards.views.GridStackDsItemView.prototype, Backbone.Epoxy.View.prototype, {

    enteredScreen: false,

  	initialize(options) {
        const tableTemplateHtml = $('#id_dataTableTemplate').html();
        this.tableTemplate = undefined;
        if (tableTemplateHtml) {
            this.tableTemplate = _.template(tableTemplateHtml);
        }
        this.parameters = options.parameters;
        this.retryConfig = options.retryConfig;
        this.dataViewId = options.id;
        this.resource = options.resource;

        document.addEventListener('scroll', this.checkPosition.bind(this));
        this.checkPosition();
        return this;
    },

    checkPosition() {
        // render widget only if it is in screen
        if (!this.enteredScreen) {
            const documentPosition = $(document).scrollTop() + $(window).height();
            const widgetPosition = this.$el.offset().top;
            if (widgetPosition < documentPosition) {
                this.enteredScreen = true;
                this.fetchData(0);
            }
        }
    },

    fetchData(retryCount = 0) {
        const params = this.getParams();
        const url = `/rest/datastreams/${this.dataViewId}/data.json/?&limit=50&page=0&${params}`;
        this.showLoading();
        $.getJSON(url)
            .fail((response) => {
                let responseJSON;
                try {
                    responseJSON = JSON.parse(response.responseText);
                } catch (err) {}
                if (responseJSON && responseJSON.status === 408) {
                    if(retryCount < this.retryConfig.retryLimit){
                        this.$(".loading .retrying.text").show();
                        setTimeout(() => {
                            // reintentamos
                            this.fetchData(retryCount + 1);
                        }, this.retryConfig.retryDelay);
                    }else{
                        this.hideLoading();
                        let $retryLater = this.$(".retry-later");
                        if( $retryLater.length == 0 ){
                            this.$(".loading").after("<p class='retry-later text center'><a id='id_retryButton'>"+ responseJSON.description +"</a></p>");
                        }else{
                            $retryLater.show();
                        }
                    }
                } else {
                    this.hideLoading();
                    addGritter(gettext('APP-ERROR-TEXT'), gettext('APP-REQUEST-ERROR'), true, false);
                }
            })
            .done((data) => {
                this.data = data;
                this.hideLoading();
                this.setTimestamp();
                this.render();
            });
    },

    setTimestamp() {
        let timeID = this.resource.get('id');
        timeID = timeID.split('resource');
        timeID = `#tooltip-time-${timeID[0]}widget${timeID[1]}`;

        // If has timeID, and timestamp exists, then proceed
        if (
            $(timeID).length > 0
        && !_.isUndefined(this.data)
        && !_.isUndefined(this.data.fTimestamp)
        ) {
            let timestamp = this.data.fTimestamp;
            const dFormat = 'MMMM DD, Y';
            const tFormat = 'hh:mm A';
            let dt;
            let timeText = $(timeID).find('li > div').html();

            if (timeText.indexOf('has-timestamp') != -1) {
                timeText = $(timeID).find('li > div > .has-modified-at').html();
            }

            // sometimes are seconds, sometimes milliseconds
            if (timestamp < 100000000000) {
                timestamp *= 1000;
            }

            // Get locale from lang attribute un <html>
            let local = $('html').attr('lang');

            // If spanish
            if (local === 'es' || local.indexOf('es-') != -1 || local.indexOf('es_') != -1) {
                local = 'es';
                // else englishs
            } else {
                // (?) if I use "en" doesn't work, I must use "" for "en"
                local = '';
            }

            if (timestamp == 0) {
                dt = new moment().locale(local);
            } else {
                dt = new moment(timestamp).locale(local);
            }

            dateFormatted = dt.format(dFormat);

            timeFormatted = dt.format(tFormat);

            timestamp = `${dateFormatted}, ${timeFormatted}`;

            // Render time text with modified at and timestamp
            $(timeID).find('li > div').html(`<span class="has-modified-at">${timeText}</span><br><br>${gettext('VIEWDS-INFO-LASTUPDATE')}<br><span style="text-transform:capitalize;" class="has-timestamp">${timestamp}</span>`);
        }
    },

    getParams() {
        const params = [];
        _.forEach(this.parameters, (item) => {
            params.push(`pArgument${item.position}=${encodeURIComponent(item.value)}`);
        });
        return params.join('&');
    },

    showLoading() {
        this.$('.loading').show();
    },

    hideLoading() {
        this.$('.loading').hide();
    },

    render() {
        const tableHeight = `${this.$('.render-area').height() - 7}px`;

        // Horrible hack que debría hacerse en el momento de buscar los datos y no en el render
        const dataResult = this.data;
        processed = processV8Results(dataResult);
        let trueHeader = false;

        // Si vienen headers
        if (processed.header.length > 0) {
            trueHeader = true;
        }

        let html;

        // TABLA
        if (dataResult.fType == 'ARRAY') {
            html = renderV8Table(processed.body, processed.header, dataResult.fCols, dataResult.fRows, dataResult.fType, trueHeader);

            // 1 CELDA (cuando es 204 o algun otro error)
        } else {
            html = renderV8Table(dataResult, null, 1, 1, dataResult.fType, false);
        }

        if (this.tableTemplateElement) {
            html += this.tableTemplate({
                result: this.data,
                tableHeight,
                resource: this.resource,
            });
        }

        this.$('.render-area').html(html);
        OverlayScrollbars(this.$('.custom-scrollbar')[0], { scrollbars: { autoHide: 'move' } });
        this.setTooltipHeight();
    },

    setTooltipHeight() {
        const tooltipHeight = $('.tooltip').height();
        let renderAreaHeight = $('.tooltip .render-area').height();
        const sectionTitleHeight = $('.tooltip .section-title').height();

        if (renderAreaHeight > tooltipHeight) {
            renderAreaHeight = tooltipHeight - sectionTitleHeight;

            $('.tooltip .render-area').css({
                height: renderAreaHeight,
            });
        }
    },

});

Dashboards.views.GridStackDsItemView.extend = Backbone.Epoxy.View.extend;
