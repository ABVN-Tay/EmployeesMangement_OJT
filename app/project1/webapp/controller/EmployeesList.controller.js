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
        
            // Optional toast for feedback
            sap.m.MessageToast.show("Pressed: " + oEmployee.firstName + " " + oEmployee.lastName +"    ID: " + oEmployee.ID);
        
            // Get the router
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        
            // Navigate to detail view with employee ID
            oRouter.navTo("EmployeesDetail", {
                id: oEmployee.ID
            });
		}  
    });
});