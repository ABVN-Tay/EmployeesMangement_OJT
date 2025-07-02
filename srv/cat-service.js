const cds = require('@sap/cds');
const { request } = require('express');
class EmployeesService extends cds.ApplicationService {
  init() {
    this.before('CREATE', 'Employees', req => {
      console.log("Before",req.data)
    });
    this.after('CREATE', 'Employees', req => {
      console.log("After",req.data)
    });
    this.before('UPDATE', 'Employees', req => {
      console.log("Before",req.data)
    });
    this.after('UPDATE', 'Employees', req => {
      console.log("After",req.data)
    });
    this.on('getCurrentUser', async (req) => {
      // console.log(req)
      const user = req.user;
      console.log(user)
      
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
    return super.init()
  }
  //Check age validation
  validateAgeOver18(dob) {
    if(!dob){
      return true;
    }
    const dobDate = new Date(dob);
    const today = new Date();

    const age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }
  //Check Date format 
  validateDateString(input) {
    if(!input){
      return true;
    }
    const date = new Date(input)
      if (isNaN(date.getTime())) {
        return false;
      }
    return true;
  }
  //Check email
  validateEmail(email) {
    if(!email){
      return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  //Check gender
  validateGender(gender) {
    if(!gender){
      return true;
    }
    const validGenders = ["Male", "Female", "Other"];
    return validGenders.includes(gender);
  }
  //Check Hire Date
  validateHireDate(hireDate) {
    if(!hireDate){
      return true;
    }
    const today = new Date();
    return new Date(hireDate) <= today;
  }
  //Check DOB
  validateDateOfBirth(dob, hireDate) {
    if(!dob || !hireDate){
      return true;
    }
    const dobDate = new Date(dob);
    const hire = new Date(hireDate);
    const today = new Date();

    return dobDate < hire && dobDate < today;
  }
  // Validate all information
  validateEmployee(employee) {
    const errors = [];
    if (!this.validateGender(employee.gender)) {
      errors.push("Invalid gender. Must be 'Male', 'Female', or 'Other'.");
    }

    if (!this.validateEmail(employee.email)) {
      errors.push("Invalid email format.");
    }

    if (!this.validateDateString(employee.dateOfBirth)) {
      errors.push("Invalid date for Date of Birth");
    }

    if (!this.validateDateString(employee.hireDate)) {
      errors.push("Invalid date for Hire Date");
    }

    if (this.validateDateString(employee.dateOfBirth) && this.validateDateString(employee.hireDate)) {
      if (!this.validateHireDate(employee.hireDate)) {
        errors.push("Hire date cannot be in the future.");
      }

      if (!this.validateDateOfBirth(employee.dateOfBirth, employee.hireDate)) {
        errors.push("Date of birth must be before hire date and in the past.");
      }
      if (!this.validateAgeOver18(employee.dateOfBirth)) {
        errors.push("Employee must be at least 18 years old.");
      }
    }

    return errors;
  }
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

// module.exports = async function () {
//     this.before('UPDATE','Employees',async (req) => {
//       // validation before update
//       const employee = req.elements;
//       const errors = base.validateEmployee(employee);
//       if (errors.length > 0) {
//         return errors[0];
//       }
//     }),

//     this.on('getCurrentUser', async (req) => {
//       const user = req.user;
//       const hasAdminRole = !!(user.roles && user.roles.Admin);
//       return {
//         id: user.id,
//         email: user.attr?.email || "Not available",
//         roles: hasAdminRole ? "Admin" : "Viewer",
//         isEdit: false
//       };
//     });
//   };