using employees_management.db as my from '../db/schema';
@path: '/catalogService'
service CatalogService  @(require: 'authenticated-user') {    
    entity Employees @(restrict: [
        { grant: ['READ'], to: 'Viewer' },
        { grant: ['READ','UPDATE','CREATE'], to: 'Admin'},
    ]) 
    as projection on my.Employees;
    entity Departments as projection on my.Departments;
    entity Roles as projection on my.Roles;

    function getCurrentUser() returns {
        id    : String;
        email : String;
        roles : String;
    };
}


