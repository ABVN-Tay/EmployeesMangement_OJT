const cds = require('@sap/cds');
const { request } = require('express');
class EmployeesService extends cds.ApplicationService {
  init() {
    const { Employees, Roles, Departments } = this.entities;
    this.on('getCurrentUser', async (req) => {
      const user = req.user;
      const hasAdminRole = (user.roles && user.roles.Admin);
      return {
        id: user.id,
        email: user.attr?.email || "Not available",
        roles: hasAdminRole ? "Admin" : "Viewer",
        firstName: user.attr.giveName || "Unknow",
        lastName: user.attr.familyName || "Unknow",
        isEdit: false,
        token: user.tokenInfo ? user.tokenInfo.jwt : ""
      }
    })
    this.on('calculateSalary', async (req)=>{
      const hireDate   = req.data.hireDate;
      const roles_ID = req.data.roles_ID
      if(!hireDate || !roles_ID){
        throw new Error(`missing parameter to calculate the salary`);
      }
      const role = await SELECT.one.from(Roles).where({ ID: roles_ID });
      if (!role || !role.baseSalary) {
        throw new Error(`Role not found or base salary not defined for role ID: ${roleId}`);
      }
      const baseSalary = parseFloat(role.baseSalary);

      const employmentYears = this.calculateEmploymentYears(hireDate);
      let addiSalary = employmentYears * 1000;
      let calSalary = parseFloat(baseSalary) + parseFloat(addiSalary)
      return calSalary;

    })
    return super.init()
  };
 
  // Function to calculate employment years
  calculateEmploymentYears(hireDateStr) {
    const hireDate = new Date(hireDateStr);
    const today = new Date();

    let years = today.getFullYear() - hireDate.getFullYear();

    const isBeforeAnniversary =
      today.getMonth() < hireDate.getMonth() ||
      (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate());

    if (isBeforeAnniversary) {
      years -= 1;
    }

    return years;
  }
}
module.exports = EmployeesService