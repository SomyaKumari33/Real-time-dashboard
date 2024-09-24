sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Column",
    "sap/m/Text",
    'sap/m/Label',
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/core/Fragment",
    "sap/ui/core/Control",
    "sap/m/MessageBox",
    "sap/m/LoadState",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Dialog"

], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Column, Text, Label,  SelectDialog, StandardListItem, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, MessageBox, LoadState, ChartFormatter, Format, Popover, VBox, Dialog) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.currentPlugin.currentPlugin.controller.MainView", {
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;

            // Set up an empty JSONModel to store the fetched data
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

            // Fetch data immediately
            this._fetchData();
        },

        _fetchData: function () {
            var that = this;
            var sUrl = this.getPublicApiRestDataSourceUri() + '/resource/v2/resources';
            var oParameters = {
                plant: 'M205'  // Example parameter
            };

            // Fetch data using the ajax method
            this.ajaxGetRequest(sUrl, oParameters, function (oResponseData) {
                that.handleResponse(oResponseData);
            }, function (oError, sHttpErrorMessage) {
                that.handleErrorMessage(oError, sHttpErrorMessage);
            });
        },

        handleResponse: function (oResponseData) {
            console.log("Data received:", oResponseData);
            var oModel = this.getView().getModel("data");
            oModel.setData(oResponseData);  // Automatically updates the chart
        },

        handleErrorMessage: function (oError, sHttpErrorMessage) {
            var err = oError || sHttpErrorMessage;
            this.showErrorMessage(err, true, true);
        },

        onPress: function (oEvent) {
            // Get the selected resource data from the clicked tile
            var oSelectedResource = oEvent.getSource().getBindingContext("data").getObject();
            var oModel = this.getView().getModel("data");
            var allData = oModel.getData();

            // Filter data to only show the selected resource in the chart
            var filteredData = {
                resources: allData.resources.filter(function (resource) {
                    return resource.resource === oSelectedResource.resource;
                })
            };

            // Set the filtered data to a new model for the dialog chart
            var oFilteredModel = new JSONModel(filteredData);
            this._openChartDialog(oFilteredModel);
        },

        _openChartDialog: function (oModel) {
            // Create a dialog with a VizFrame to display the chart
            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    title: "Resource Data",
                    contentWidth: "80%",
                    contentHeight: "400px",
                    resizable: true,
                    content: new sap.viz.ui5.controls.VizFrame({
                        width: "100%",
                        height: "100%",
                        vizType: "column",
                        dataset: new sap.viz.ui5.data.FlattenedDataset({
                            dimensions: [{
                                name: "Resource",
                                value: "{data>resource}"
                            }],
                            measures: [{
                                name: "Efficiency",
                                value: "{data>efficiency}"
                            }],
                            data: {
                                path: "data>/resources"
                            }
                        }),
                        feeds: [
                            new sap.viz.ui5.controls.common.feeds.FeedItem({
                                uid: "valueAxis",
                                type: "Measure",
                                values: ["Efficiency"]
                            }),
                            new sap.viz.ui5.controls.common.feeds.FeedItem({
                                uid: "categoryAxis",
                                type: "Dimension",
                                values: ["Resource"]
                            })
                        ]
                    }),
                    beginButton: new Button({
                        text: "Close",
                        press: function () {
                            this._oDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oDialog);
            }

            // Set the filtered data model to the dialog's VizFrame
            this._oDialog.getContent()[0].setModel(oModel, "data");
            this._oDialog.open();
        },

    
        onAfterRendering: function(){
           
            this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
            
            this.getView().byId("headerTitle").setText(this.getConfiguration().title);
            this.getView().byId("textPlugin").setText(this.getConfiguration().text); 

        },

		onBeforeRenderingPlugin: function () {

			
			
		},

        isSubscribingToNotifications: function() {
            
            var bNotificationsEnabled = true;
           
            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function(sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function(sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function(oMsg) {
           
            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name){
                        case "template":
                            
                            break;
                        case "template2":
                            
                        
                        }        
          

                    
                }
            }

        },
        

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);
         

		}
	});
});