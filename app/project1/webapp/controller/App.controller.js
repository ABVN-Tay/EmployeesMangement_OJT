sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("project1.controller.App", {
      onInit() {
        const oModel = this.getOwnerComponent().getModel();

        oModel.bindContext("/getCurrentUser()", null)
          .requestObject()
          .then((oData) => {
            const oLocal = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oLocal, "local");
          })
          .catch(console.error);        
      }
  });
});