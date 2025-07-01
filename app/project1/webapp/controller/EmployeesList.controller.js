sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller,MessageToast,JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.EmployeesList", {
        onInit() {
          
        },
        onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            
            //this gets the row data object
            var oEmployee = oBindingContext.getObject(); 
        
            // Get the router
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        
            // Navigate to detail view with employee ID
            oRouter.navTo("EmployeesDetail", {
                id: oEmployee.ID
            });
		},
        onAddPress: function(){
            this.setEditMode()
            this.getOwnerComponent().getRouter().navTo("Create");
        },

        setEditMode: function(){
            const oLocalModel = this.getView().getModel("local");
            oLocalModel.setProperty("/isEdit", true);
        }
    });
});