sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "project1/controller/Base.controller",
    "sap/ui/core/format/DateFormat",
], function (Controller, History, MessageBox, JSONModel, BaseController, DateFormat) {
    "use strict";

    return BaseController.extend("project1.controller.Create", {
        onInit: function () {
            //Initial employee Information
            const initEmployee = {
                ID: "",
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                gender: "",
                email: "",
                hireDate: "",
                roles_ID: "",
                departments_ID: ""
            };
            // create Model for view
            const empModel = new JSONModel(initEmployee);
            this.getView().setModel(empModel, "initEmployee");

            // this.setEditMode();
            const validGenders = ["Male", "Female", "Other"];

            // Convert array to key-text format for binding
            const genderData = validGenders.map(gender => ({
                key: gender,
                text: gender
            }));

            const genderModel = new JSONModel(genderData);
            this.getView().setModel(genderModel, "genderModel");


            const oModel = this.getOwnerComponent().getModel();
            //Binding Deparments Model to View
            oModel.bindList("/Departments").requestContexts().then(aContexts => {
                const aDepartments = aContexts.map(ctx => ctx.getObject());
                const oDepartJSONModel = new sap.ui.model.json.JSONModel({ Departments: aDepartments });
                console.log(oDepartJSONModel)
                this.getView().setModel(oDepartJSONModel, "departmentsModel");
            });
            //Binding Roles Model to View        
            oModel.bindList("/Roles").requestContexts().then(aContexts => {
                const aRoles = aContexts.map(ctx => ctx.getObject());
                const oRoleJSONModel = new sap.ui.model.json.JSONModel({ Roles: aRoles });
                console.log(oRoleJSONModel)
                this.getView().setModel(oRoleJSONModel, "rolesModel");
            })
        },

        onSavePress: async function () {
            // get data model from view (oModel binding in View)
            const oEmployee = this.getView().getModel("initEmployee").oData;
            console.log("initEmployee ", oEmployee)

            // setup employee to create 
            const newEmployee = {
                ID: "",
                firstName: oEmployee.firstName,
                lastName: oEmployee.lastName,
                dateOfBirth: oEmployee.dateOfBirth,
                gender: oEmployee.gender,
                email: oEmployee.email,
                hireDate: oEmployee.hireDate,
                departments_ID: oEmployee.departments_ID,
                roles_ID: oEmployee.roles_ID
            };
            console.log(newEmployee)

            //send request to create new employee
            fetch("/catalogService/Employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newEmployee)
            })
                .then(response => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(data => {
                    console.log("Employee created:", data);
                })
                .catch(err => {
                    console.error("Error creating employee:", err);
                });

        },
        onSamplePress: function () {
            const initEmployee = {
                ID: "",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1990-05-15",
                gender: "Male",
                email: "john.doe@example.com",
                hireDate: "2023-01-10",
                roles_ID: "57e61a56-e7f1-4e91-949d-2b9ae73d3903",       //Marketing Specialist , 68000
                departments_ID: "9c1f63ef-3c65-4373-8927-6e2fca942e70"  //Marketing
            };
            console.log(initEmployee)
            const empModel = new JSONModel(initEmployee);
            this.getView().setModel(empModel, "initEmployee");
        },
        onCancelPress: function () {
            const oModel = this.getView().getModel();
            const oContext = this.getView().getBindingContext();

            // Roll back the new entry
            oModel.deleteCreatedEntry(oContext);

            this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
            }

            this.setDisplayMode();
        },
        isVisibleForAdminNotEditing: function (role, isEdit) {
            return role === 'Admin' && isEdit === false;
        },
        isVisibleForAdminEditing: function (role, isEdit) {
            return role === 'Admin' && isEdit === true;
        },

        setDisplayMode: function () {
            const oLocalModel = this.getView().getModel("local");
            oLocalModel.setProperty("/isEdit", false);

            //Status after change
            const isEditAfter = oLocalModel.getProperty("/isEdit");
            console.log("Edit Mode:", isEditAfter);
        },
        setEditMode: function () {
            const oLocalModel = this.getView().getModel("local");
            oLocalModel.setProperty("/isEdit", true);
        },
    });
})