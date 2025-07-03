sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.EmployeesList", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEmployeesList").attachPatternMatched(this._onBindingObject, this);
        },
        _onBindingObject: function(){
            // Refresh the binding of the table
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.refresh(); // Triggers data reload from backend
            }
            // Add filter to Employee List
            // const oModel = this.getView().getModel();
            // //Binding Deparments Model to View
            // oModel.bindList("/Departments").requestContexts().then(aContexts => {
            //     const aDepartments = aContexts.map(ctx => ctx.getObject());
            //     const oDepartJSONModel = new JSONModel({ Departments: aDepartments });
            //     console.log(oDepartJSONModel)
            //     this.getView().setModel(oDepartJSONModel, "departmentsModel");
            // });

            // //Binding Roles Model to View        
            // oModel.bindList("/Roles").requestContexts().then(aContexts => {
            //     const aRoles = aContexts.map(ctx => ctx.getObject());
            //     const oRoleJSONModel = new JSONModel({ Roles: aRoles });
            //     console.log(oRoleJSONModel)
            //     this.getView().setModel(oRoleJSONModel, "rolesModel");
            // });
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
        onAddPress: function () {
            this.setEditMode()
            this.getOwnerComponent().getRouter().navTo("Create");
        },

        setEditMode: function () {
            const oLocalModel = this.getView().getModel("local");
            oLocalModel.setProperty("/isEdit", true);
        }
    });
});