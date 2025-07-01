sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "project1/controller/Base.controller",
  "sap/ui/core/format/DateFormat"
], function (Controller, History, MessageBox, MessageToast, JSONModel, BaseController, DateFormat) {
  "use strict";
  let sId = '';
  return BaseController.extend("project1.controller.Detail", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("EmployeesDetail").attachPatternMatched(this._onObjectMatched, this);

    },

    _onObjectMatched: function (oEvent) {
      sId = oEvent.getParameter("arguments").id;
      const oModel = this.getView().getModel();
      const sPath = `/Employees('${sId}')`;
      //Binding Employee Model to View
      const validGenders = ["Male", "Female", "Other"];
      oModel.bindContext(sPath, null, {
        $expand: 'departments($select=ID,name),roles($select=ID,name,baseSalary)'
      })
        .requestObject().then((oEmployee) => {
          const oEmpJSONModel = new JSONModel(oEmployee);
          this.getView().setModel(oEmpJSONModel, "detailModel");
          console.log("detail model", oEmpJSONModel);
        });

      // Convert array to key-text format for binding
      const genderData = validGenders.map(gender => ({
        key: gender,
        text: gender
      }));

      const genderModel = new JSONModel(genderData);
      this.getView().setModel(genderModel, "genderModel");

      //Binding Deparments Model to View
      oModel.bindList("/Departments").requestContexts().then(aContexts => {
        const aDepartments = aContexts.map(ctx => ctx.getObject());
        const oDepartJSONModel = new JSONModel({ Departments: aDepartments });
        console.log(oDepartJSONModel)
        this.getView().setModel(oDepartJSONModel, "departmentsModel");
      });

      //Binding Roles Model to View        
      oModel.bindList("/Roles").requestContexts().then(aContexts => {
        const aRoles = aContexts.map(ctx => ctx.getObject());
        const oRoleJSONModel = new JSONModel({ Roles: aRoles });
        console.log(oRoleJSONModel)
        this.getView().setModel(oRoleJSONModel, "rolesModel");
      });
    },
    onAddPress: function () {
      console.log("Add button pressed");

    },
    onCaculatePress: function () {
      // get data model from view (oModel binding in View)
      const oEmployeeModel = this.getView().getModel("detailModel");
      const oEmployee = oEmployeeModel.getData();
      console.log("Employee detail ", oEmployee.firstName)

      let hireDate = oEmployee.hireDate;
      let baseSalary = oEmployee.roles.baseSalary;
      let employmentYears = this.calculateEmploymentYears(hireDate);
      let addiSalary = employmentYears * 1000;
      let calSalary = parseFloat(baseSalary) + parseFloat(addiSalary)
      oEmployeeModel.setProperty("/salary", calSalary.toString())
      console.log(oEmployee)

    },
    onCancelPress: function () {
      const localModel = this.getView().getModel("local");
      const originModel= this.getView().getModel("originModel")

      const orignData  = originModel.getData()
      const localData  = localModel.getData();

      const detailModel = new JSONModel(orignData)
      const isChange   = this.checkchange()

      console.log("orignData", orignModel)
      if (localData.isEdit && isChange) {
        MessageBox.confirm(
          "You have unsaved changes. Are you sure you want to leave without saving?",
          {
              title: "Unsaved Changes",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (oAction) {
                  if (oAction === MessageBox.Action.YES) {
                    this.getView().setModel(detailModel, "detailModel");
                    this.setDisplayMode();
                  }
              }.bind(this)
          }
        );        
      }
      else {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.setDisplayMode();
          this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
        }
      }
    },

    onSavePress: async function () {
      // get data model from view (oModel binding in View)
      const oEmployee = this.getView().getModel("detailModel").getData();
      console.log("Employee detail ", oEmployee.firstName)
      const salary = parseFloat(oEmployee.salary)
      oEmployee.salary = salary
      const errors = this.validateEmployee(oEmployee);
      if (errors.length > 0) {
        MessageBox.error(errors[0]);
      } else {
        // const inputData = oEmployee;
        // delete inputData.roles;
        // delete inputData.departments;
        // console.log(inputData)
        const newEmployee = {
          ID: oEmployee.ID,
          firstName: oEmployee.firstName,
          lastName: oEmployee.lastName,
          dateOfBirth: oEmployee.dateOfBirth,
          gender: oEmployee.gender,
          email: oEmployee.email,
          hireDate: oEmployee.hireDate,
          departments_ID: oEmployee.departments_ID,
          roles_ID: oEmployee.roles_ID,
        };
        console.log(sId)
        console.log(newEmployee)
        fetch(`/catalogService/Employees('${sId}')`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newEmployee)
        })
          .then(response => {
            console.log(response)
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then(data => {
            console.log("Employee update:", data);
            MessageToast.show("Update successfully")
            this.setDisplayMode();
          })
          .catch(err => {
            console.error("Error creating employee:", err);
          });
      }
    },

    onEditPress: function () {
      const detailOrignData = this.getView().getModel("detailModel").getData()
      const detailOrignModel = new JSONModel(detailOrignData);
      this.getView().setModel(detailOrignModel, "originModel");
      console.log("origin data", detailOrignData)
      this.setEditMode();
    },
    checkchange: function () {
      const orignModel = this.getView().getModel("originModel");
      const detailModel = this.getView().getModel("detailModel");


      const originData = orignModel.getData();
      const detailData = detailModel.getData();

      var aFieldsToCompare = [
        "firstName",
        "lastName",
        "email",
        "dateOfBirth",
        "gender",
        "hireDate",
        "salary"
      ];

      for (var i = 0; i < aFieldsToCompare.length; i++) {
        var sField = aFieldsToCompare[i];
        var originalValue = originData[sField];
        var currentValue = detailData[sField];

        // Handle date comparison
        if (sField.includes("Date")) {
          originalValue = originalValue ? new Date(originalValue).toDateString() : "";
          currentValue = currentValue ? new Date(currentValue).toDateString() : "";
        }

        if (originalValue !== currentValue) {
          return true;
        }
      }
       // Compare department and role IDs
       var originalDeptId = originData.departments ? originData.departments.ID : null;
       var currentDeptId = detailData.departments ? detailData.departments.ID : null;

       var originalRoleId = originData.role ? originData.roles.ID : null;
       var currentRoleId = detailData.roles ? detailData.roles.ID : null;

       return originalDeptId !== currentDeptId || originalRoleId !== currentRoleId;
    },
    onNavBack: function () {
      const localModel = this.getView().getModel("local");
      const localData = localModel.getData();
      const isChange = this.checkchange()

      if (localData.isEdit && isChange) {
        MessageBox.confirm(
          "You have unsaved changes. Are you sure you want to leave without saving?",
          {
              title: "Unsaved Changes",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (oAction) {
                  if (oAction === MessageBox.Action.YES) {
                    const orignData = this.getView().getModel("originModel").getData()
                    const orignModel = new JSONModel(orignData)
                    this.getView().setModel(orignModel, "detailModel")
                    consolog.log(orignData)
                    this.setDisplayMode();
                  }
              }.bind(this)
          }
        );        
      }
      else {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.setDisplayMode();
          this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
        }
      }
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
      //Status after change
      const isEditAfter = oLocalModel.getProperty("/isEdit");
      console.log("Edit Mode:", isEditAfter);

    },
    onRoleChange: async function (oEvent) {
      console.log(oEvent)
      // Binding Employee Model to View
      const sPath = `/Employees('${sId}')`;
      this.getView().bindElement({
        path: sPath,
        parameters: {
          expand: 'departments($select=ID,name),roles($select=ID,name,baseSalary)'
        },
      })
    }
  });
});