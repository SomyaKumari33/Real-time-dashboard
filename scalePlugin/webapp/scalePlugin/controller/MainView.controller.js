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
    "sap/m/MessageBox"

    
], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Column, Text, Label,  SelectDialog, StandardListItem, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, MessageBox) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.scalePlugin.scalePlugin.controller.MainView", {
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

             // Fetch the data
             this._fetchData();
            },
    
            onSearch: function (oEvent) {
                var oFilterBar = oEvent.getSource(),
                    aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                    aFilters = [];
    
                aFilters = aFilterGroupItems.map(function (oFGI) {
                    var oControl = oFGI.getControl();
                    if (oControl && oControl.getValue) {
                        var sValue = oControl.getValue();
                        if (sValue) {
                            return new Filter({
                                path: oFGI.getName(),
                                operator: FilterOperator.EQ,
                                value1: sValue
                            });
                        }
                    }
                    return null;
                }).filter(function (oFilter) {
                    return oFilter !== null;
                });
    
                var oTable = this.getView().byId('table');
                var oItemsTemplate = this.getView().byId('idTableListItem2');

                oTable.bindItems({
                    path: '/',
                    model: 'data',
                    filters: aFilters,
                    template: oItemsTemplate,
                    templateShareable: true
                });
                // var oBinding = oTable.getBinding("items");
                // if (oBinding) {
                //     oBinding.filter(aFilters);
                // } else {
                //     console.error("Table binding is not available");
                // }
            },
            // statusColorFormatter: function(sStatus){
            //     if(sStatus === "ENABLED"){
            //         return "Success";
            //     }
            //     else if(sStatus === "PRODUCTIVE"){
            //         return "Error";
            //     }
            //     else{
            //         return "None";
            //     }
                
            // },
           
           
            // API Fetch method
            _fetchData: function () {
                var that = this;
                var sUrl = this.getPublicApiRestDataSourceUri() + '/resource/v2/resources';
                var oParameters = {
                    plant: 'M205'
                };
    
                this.ajaxGetRequest(sUrl, oParameters, function (oResponseData) {
                    that.handleResponse(oResponseData);
                }, function (oError, sHttpErrorMessage) {
                    that.handleErrorMessage(oError, sHttpErrorMessage);
                });
            },
    
            handleResponse: function (oResponseData) {
                console.log("Data received:", oResponseData);
                var oModel = this.getView().getModel("data");
                oModel.setData(oResponseData);
            },
    
            handleErrorMessage: function (oError, sHttpErrorMessage) {
                var err = oError || sHttpErrorMessage;
                this.showErrorMessage(err, true, true);
            },
            statusColorFormatter: function(sStatus) {
                switch(sStatus) {
                    case "ENABLED":
                        return "Success"; // Green
                    case "PRODUCTIVE":
                        return "Error"; // Red
                    default:
                        return "None"; // Default state, but you can remove this if not needed
                }
            },
            
    
            // Value Help for Resource Input
            onValueHelpRequest: function (oEvent) {
                var oInput = oEvent.getSource();
                if (!this._oResourceValueHelpDialog) {
                    this._oResourceValueHelpDialog = new SelectDialog({
                        title: "Select Resource",
                        items: {
                            path: "data>/", // Adjust path based on your data structure
                            template: new StandardListItem({
                                title: "{data>resource}",
                                description: "{data>description}"
                            })
                        },
                        search: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new Filter("resource", FilterOperator.Contains, sValue);
                            oEvent.getSource().getBinding("items").filter([oFilter]);
                        },
                        confirm: function (oEvent) {
                            var oSelectedItem = oEvent.getParameter("selectedItem");
                            if (oSelectedItem) {
                                oInput.setValue(oSelectedItem.getTitle());
                            }
                        }
                    });
                    this.getView().addDependent(this._oResourceValueHelpDialog);
                }
                this._oResourceValueHelpDialog.open();
            },
    
            // Value Help for Work Center Input
            onWorkCenterValueHelpRequest: function (oEvent) {
                var oInput = oEvent.getSource();
                if (!this._oWorkCenterValueHelpDialog) {
                    this._oWorkCenterValueHelpDialog = new SelectDialog({
                        title: "Select Work Center",
                        items: {
                            path: "data>/", // Adjust path based on your data structure
                            template: new StandardListItem({
                                title: "{data>description}",
                                description: "{data>description}"
                            })
                        },
                        search: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new Filter("description", FilterOperator.Contains, sValue);
                            oEvent.getSource().getBinding("items").filter([oFilter]);
                        },
                        confirm: function (oEvent) {
                            var oSelectedItem = oEvent.getParameter("selectedItem");
                            if (oSelectedItem) {
                                oInput.setValue(oSelectedItem.getTitle());
                            }
                        }
                    });
                    this.getView().addDependent(this._oWorkCenterValueHelpDialog);
                }
                this._oWorkCenterValueHelpDialog.open();
            },
            onClearPress: function () {
                // Clear Filter Bar Inputs
                var oFilterBar = this.getView().byId("filternbars");
                var aFilterGroupItems = oFilterBar.getFilterGroupItems();
            
                // Clear each filter input
                aFilterGroupItems.forEach(function(oFGI) {
                    var oControl = oFGI.getControl();
                    if (oControl && oControl.setValue) {
                        oControl.setValue(""); // Clear the input field
                    }
                });
            
                // Clear values in the table items
                var oTable = this.getView().byId('table');
                var oItems = oTable.getItems();
            
                // Loop through each item and reset the values
                oItems.forEach(function(oItem) {
                    // Assuming each ColumnListItem has Text controls to be cleared
                    var aCells = oItem.getCells();
                    aCells.forEach(function(oCell) {
                        if (oCell.setText) {
                            oCell.setText(""); // Clear the text value
                        }
                    });
                });
            },
            
            //     var oTable = this.getView().byId('table');
            //     var oModel = this.getView().getModel("data");
            //     oModel.setData([]); // Clear the data in the model
            //     oTable.bindItems({
            //         path: "/",
            //         model: "data",
            //         template: this.getView().byId('idTableListItem2'),
            //         templateShareable: true
            //     });
            // },
            
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