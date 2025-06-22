namespace employees_management.db;

entity Departments {
  key ID : UUID;
  name : String;
}

entity Roles {
  key ID      : UUID;
  name        : String;
  baseSalary  : Decimal(15,2);
}

entity Employees {
  key ID      : UUID;
  firstName   : String;
  lastName    : String;
  dateOfBirth : Date;
  gender      : String;     
  email       : String;      
  hireDate    : Date; 
  departments : Association to one Departments;
  roles       : Association to one Roles;
}

