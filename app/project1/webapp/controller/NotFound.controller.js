// const { init } = require("@sap/cds/lib/ql/cds.ql-Query");

sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("project1.controller.NotFound", {
      onInit: function () {
        // const oRouter = this.getOwnerComponent().getRouter();
        // oRouter.getRoute("NotFound").attachPatternMatched(this._onObjectMatched, this);
        
      },
      onNavHome: function () {
        this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
      }
    });
  });