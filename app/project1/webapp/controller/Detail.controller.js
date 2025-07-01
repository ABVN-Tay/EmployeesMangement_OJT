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
          this._oOriginalData = JSON.parse(JSON.stringify(oEmployee));
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
      var oBundle = this.getView().getModel("i18n").getResourceBundle();
      var sCancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
      const localModel = this.getView().getModel("local");
      const detailModel = this.getView().getModel("detailModel");
      const localData = localModel.getData();
      const isChange = this.checkchange();
      if (localData.isEdit && isChange) {
        MessageBox.confirm(
          sCancelMessage,
          {
            title: "Unsaved Changes",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.NO,
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                //set the original data to detail model
                detailModel.setData(this._oOriginalData);
                this.setDisplayMode();
              }
            }.bind(this)
          }
        );
      }
      else {
        this.setDisplayMode();
      }
    },
    saveEmployeeData:  function(){
      // get data model from view (oModel binding in View)
      const oEmployee = this.getView().getModel("detailModel").getData();
      const oLocal = this.getView().getModel("local").getData();
      // const accessToken = oLocal.token;
      const accessToken = "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYzg0Mzc5YTZ0cmlhbC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktZTkyMzc1YzU3NSIsInR5cCI6IkpXVCIsImppZCI6ICJnVUNqVGd0U1h3R3RYeUFpSkdCQUV3MjFOVGJqempqMm4xMXhDZWZIQmpJPSJ9.eyJqdGkiOiIxZTFlZTU2MzZlYWI0MWI2ODMxYzc3YTg3NDk2ZDAxNiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiIzMDZhNmNmNS0xMzQyLTQzYWMtODYwYi1mNDAzNGU0NGJmNGEiLCJ6ZG4iOiJjODQzNzlhNnRyaWFsIn0sInVzZXJfdXVpZCI6IjZlYmMwNWI2LWYzY2QtNGVkMi04N2QzLWRmYjA3OWYwOGY5ZCIsInhzLnVzZXIuYXR0cmlidXRlcyI6e30sInhzLnN5c3RlbS5hdHRyaWJ1dGVzIjp7InhzLnJvbGVjb2xsZWN0aW9ucyI6WyJTQVAgSEFOQSBDbG91ZCBWaWV3ZXIiLCJTdWJhY2NvdW50IFNlcnZpY2UgQWRtaW5pc3RyYXRvciIsIlNBUCBIQU5BIENsb3VkIEFkbWluaXN0cmF0b3IiLCJTdWJhY2NvdW50IFZpZXdlciIsIkJ1c2luZXNzX0FwcGxpY2F0aW9uX1N0dWRpb19EZXZlbG9wZXIiLCJDbG91ZCBDb25uZWN0b3IgQWRtaW5pc3RyYXRvciIsIkFkbWluIiwiRGVzdGluYXRpb24gQWRtaW5pc3RyYXRvciIsIkJ1c2luZXNzX0FwcGxpY2F0aW9uX1N0dWRpb19FeHRlbnNpb25fRGVwbG95ZXIiLCJCdXNpbmVzc19BcHBsaWNhdGlvbl9TdHVkaW9fQWRtaW5pc3RyYXRvciIsIlN1YmFjY291bnQgQWRtaW5pc3RyYXRvciIsIkNvbm5lY3Rpdml0eSBhbmQgRGVzdGluYXRpb24gQWRtaW5pc3RyYXRvciIsIlNBUCBIQU5BIENsb3VkIFNlY3VyaXR5IEFkbWluaXN0cmF0b3IiXX0sImdpdmVuX25hbWUiOiJOR08iLCJmYW1pbHlfbmFtZSI6IlRBWSIsInN1YiI6ImE3MGFhYTBkLTYyNmEtNDU2ZS04YTZhLWNiYWY4Yjg5ZTQzNiIsInNjb3BlIjpbIm9wZW5pZCIsIkVtcGxveWVlc01hbmFnZW1lbnQhdDQ2MjI0OS5BZG1pbiJdLCJjbGllbnRfaWQiOiJzYi1FbXBsb3llZXNNYW5hZ2VtZW50IXQ0NjIyNDkiLCJjaWQiOiJzYi1FbXBsb3llZXNNYW5hZ2VtZW50IXQ0NjIyNDkiLCJhenAiOiJzYi1FbXBsb3llZXNNYW5hZ2VtZW50IXQ0NjIyNDkiLCJncmFudF90eXBlIjoiYXV0aG9yaXphdGlvbl9jb2RlIiwidXNlcl9pZCI6ImE3MGFhYTBkLTYyNmEtNDU2ZS04YTZhLWNiYWY4Yjg5ZTQzNiIsIm9yaWdpbiI6InNhcC5kZWZhdWx0IiwidXNlcl9uYW1lIjoidGF5dGhhbmgxOTk5QGdtYWlsLmNvbSIsImVtYWlsIjoidGF5dGhhbmgxOTk5QGdtYWlsLmNvbSIsImF1dGhfdGltZSI6MTc1MTM1NDM2MiwicmV2X3NpZyI6IjNlMDU0NjQ1IiwiaWF0IjoxNzUxMzU0MzYzLCJleHAiOjE3NTEzOTc1NjMsImlzcyI6Imh0dHBzOi8vYzg0Mzc5YTZ0cmlhbC5hdXRoZW50aWNhdGlvbi51czEwLmhhbmEub25kZW1hbmQuY29tL29hdXRoL3Rva2VuIiwiemlkIjoiMzA2YTZjZjUtMTM0Mi00M2FjLTg2MGItZjQwMzRlNDRiZjRhIiwiYXVkIjpbInNiLUVtcGxveWVlc01hbmFnZW1lbnQhdDQ2MjI0OSIsIkVtcGxveWVlc01hbmFnZW1lbnQhdDQ2MjI0OSIsIm9wZW5pZCJdfQ.SxSkhQSvi-Wgf-Ir0r_NTbvVyp5l0zYL5gjsQVkr4Ksdt6RvVR4QzepFVd66YD_JhVS2A8bXOLp7e-xWzmTW7OuYr1i79e0QcdeXHC6_8FgIUpc0So9gEqlN3CiUFjPD1v3rodf70dLCvDHv96Ik3UQM0eR92rA9U6RymbLbezr3IjhCKxYqOSGaYsORd-KOoigFkZvlqvQHvPafsJTUJ_m9aA2ol4bmqRfPMP3dksTsEGjXjum9Xxdj8askNWs8OP8-fiJVvSKOPBkf99hf5fVjOd84YJAr_OuZl5G-RuBtqTeT-8VUITR1UCG1_dinsCLzIcw-1jVHNRDewfBPtg";
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
        salary: parseFloat(oEmployee.salary)
      };
      console.log("accessToken",accessToken)
      console.log(newEmployee)
      fetch(`/catalogService/Employees('${sId}')`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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
    },

    onSavePress: async function () {
      var oBundle     = this.getView().getModel("i18n").getResourceBundle();
      var saveMessage = oBundle.getText("saveMessage");       // Get cancelMessagage   
      var noChangeMessage = oBundle.getText("noChange");       // Get cancelMessagage      
      const oEmployee = this.getView().getModel("detailModel").getData();
      const isChange  = this.checkchange();
      if (isChange) {
        // Show confirmation dialog before saving
        MessageBox.confirm(
          saveMessage,
          {
            title: "Confirm Save",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                const errors = this.validateEmployee(oEmployee);
                if (errors.length > 0) {
                  if (errors.length > 0) {
                    MessageBox.error(errors[0]);
                  }
                }
                else{
                    this.saveEmployeeData();
  
                }
              }
            }.bind(this)
          }
        );
      }else{
        MessageToast.show(noChangeMessage);
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
      const detailModel = this.getView().getModel("detailModel");
      const detailData = detailModel.getData();
      // Compare stringified versions (simple deep comparison)
      return JSON.stringify(detailData) !== JSON.stringify(this._oOriginalData);

    },
    onNavBack: function () {
      var oBundle = this.getView().getModel("i18n").getResourceBundle();
      var cancelMessage = oBundle.getText("cancelMessage");       // Get cancelMessagage
      const localModel = this.getView().getModel("local");
      const detailModel = this.getView().getModel("detailModel");
      const localData = localModel.getData();
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      const isChange = this.checkchange();

      if (localData.isEdit && isChange) {
        MessageBox.confirm(
          cancelMessage,
          {
            title: "Unsaved Changes",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.NO,
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.YES) {
                //set the original data to detail model
                detailModel.setData(this._oOriginalData);
                this.setDisplayMode();
                if (sPreviousHash !== undefined) {
                  window.history.go(-1);
                } else {
                  this.setDisplayMode();
                  this.getOwnerComponent().getRouter().navTo("RouteEmployeesList", {}, true);
                }
              }
            }.bind(this)
          }
        );
      }
      else {
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
      // Get the selected item
      var selectedItem = oEvent.getParameter("selectedItem").getKey();
      const rolesModel = this.getView().getModel("rolesModel");
      const detailModel = this.getView().getModel("detailModel");
      const rolesData = rolesModel.getData();

      // Convert object to array
      var aRoles = Object.values(rolesData);

      // Get matching item
      var matchRole = aRoles[0].find(item => item.ID === selectedItem);

      // console.log("Roles",rolesData);
      console.log("selected Item", selectedItem);
      console.log("Selected Role", matchRole);

      detailModel.setProperty("/roles", matchRole);

    }
  });
});