sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
  ], function (Controller, History, MessageToast, JSONModel) {
    "use strict";
  
    return Controller.extend("project1.controller.Detail", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("EmployeesDetail").attachPatternMatched(this._onObjectMatched, this);
      },
  
      _onObjectMatched: function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        const sPath = `/Employees('${sId}')`;

        this.getView().bindElement({
          path: sPath,
          parameters: {
            expand: 'departments($select=ID,name),roles($select=ID,name)' 
          }
        })
        

      },
      onAddPress: function(){
        console.log("Add button pressed");
      },
      onCaculatePress: function(){
        console.log("Caculate button pressed");
      },
      onEditPress: function(){
        console.log("Edit button pressed");
      },
      onNavBack: function () {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
  
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
        }
      }
    });
  });