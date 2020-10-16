const inquirer = require('inquirer');
const mysql = require('mysql');
const sFile = require('../server');

const Functions = function () {

    this.employees = function () {

        inquirer.prompt({
            name: 'action',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'View employee list',
                'Add an employee',
                'Update employee info',
                'Delete an employee',
                'Return to main menu'
            ]
        }).then(function (choice) {
            switch (choice.action) {
                case 'View employee list':
                    viewEmployees();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update employee info':
                    updateEmployeeInfo();
                    break;
                case 'Delete an employee':
                    deleteEmployee();
                    break;
                case 'Return to main menu':
                    sFile.mainMenu();
                    break;
            };
        });

        function viewEmployees() {
            inquirer.prompt({
                name: 'action',
                type: 'rawlist',
                message: 'What employee list would you like to view?',
                choices: [
                    'View entire employee list',
                    'View employees by Manager',
                    'Return to main menu'
                ]
            }).then(function (choice) {
                switch (choice.action) {
                    case 'View entire employee list':
                        viewAllEmployees();
                        break;
                    case 'View employees by Manager':
                        viewEmployeeByManager();
                        break;
                    case 'Return to main menu':
                        sFile.mainMenu();
                        break;
                };
            });
        };

        function viewAllEmployees() {

            sFile.connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, employee.manager_id FROM employee INNER JOIN role ON (employee.role_id = role.id) ORDER BY role.title', function (err, result) {
                if (err) throw err;

                var data = [];

                for (var i = 0; i < result.length; i++) {

                    if (result[i].manager_id === 0) {
                        data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": "None" });
                    };

                    for (var k = 0; k < result.length; k++) {

                        if (result[i].manager_id === result[k].id) {
                            data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": result[k].first_name });
                        };
                    };
                };
                console.table(data);
                sFile.mainMenu();
            });
        };

        function viewEmployeeByManager() {

            var managerArrayList = ["None"];

            sFile.connection.query("SELECT employee.id, employee.first_name FROM employee INNER JOIN role ON (employee.role_id = role.id AND role.title = ?)", ["Manager"], function (err, managerResult) {
                if (err) throw err;

                for (var i = 0; i < managerResult.length; i++) {
                    managerArrayList.push(managerResult[i].first_name);
                };

                inquirer.prompt([
                    {
                        name: "manager",
                        type: "rawlist",
                        message: "Please select a manager to view the employees they manage",
                        choices: managerArrayList
                    }
                ]).then(function (inqRes) {

                    if (inqRes.manager === "None") {
                        sFile.connection.query('SELECT employee.first_name, employee.last_name, role.title, employee.manager_id FROM employee INNER JOIN role ON (employee.role_id = role.id) WHERE (employee.manager_id = 0) ORDER BY role.title', function (err, result) {
                            if (err) throw err;

                            var data = [];

                            for (var i = 0; i < result.length; i++) {

                                data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": inqRes.manager });
                            };
                            console.table(data);
                            sFile.mainMenu();
                        });
                    } else {

                        for (var i = 0; i < managerResult.length; i++) {

                            if (inqRes.manager === managerResult[i].first_name) {

                                sFile.connection.query('SELECT employee.first_name, employee.last_name, role.title, employee.manager_id FROM employee INNER JOIN role ON (employee.role_id = role.id) WHERE (employee.manager_id = ?) ORDER BY role.title', [managerResult[i].id], function (err, result) {
                                    if (err) throw err;

                                    var data = [];

                                    for (var j = 0; j < result.length; j++) {

                                        data.push({ "First Name": result[j].first_name, "Last Name": result[j].last_name, "Position": result[j].title, "Manager": inqRes.manager });
                                    };
                                    console.table(data);
                                    sFile.mainMenu();
                                });
                            };
                        };
                    };
                });
            });
        };
    };

    function addEmployee() {

        var managerArrayList = ["None"];
        var roleArrayList = [];

        sFile.connection.query("SELECT employee.id, employee.first_name FROM employee INNER JOIN role ON (employee.role_id = role.id AND role.title = ?)", ["Manager"], function (err, managerResult) {
            if (err) throw err;

            for (var i = 0; i < managerResult.length; i++) {
                managerArrayList.push(managerResult[i].first_name);
            };

            sFile.connection.query("SELECT * FROM role", function (err, roleResult) {
                if (err) throw err;

                for (var i = 0; i < roleResult.length; i++) {
                    roleArrayList.push(roleResult[i].title);
                };

                inquirer.prompt([
                    {
                        name: "first_name",
                        type: "input",
                        message: "What is the employee's First Name?"
                    },
                    {
                        name: "last_name",
                        type: "input",
                        message: "What is the employee's Last Name?"
                    },
                    {
                        name: "role",
                        type: "rawlist",
                        message: "What is the employee's current role?",
                        choices: roleArrayList
                    },
                    {
                        name: "manager",
                        type: "rawlist",
                        message: "Who is the employee's Manager?",
                        choices: managerArrayList
                    }
                ]).then(function (inqRes) {


                    for (var j = 0; j < roleResult.length; j++) {

                        if (inqRes.role === roleResult[j].title) {

                            if (inqRes.manager === "None") {

                                sFile.connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [inqRes.first_name, inqRes.last_name, roleResult[j].id, 0], function (err, result) {
                                    if (err) throw err;
                                    console.log('Success!');
                                    sFile.mainMenu();
                                });

                            } else {

                                for (var i = 0; i < managerResult.length; i++) {

                                    if (inqRes.manager === managerResult[i].first_name) {

                                        sFile.connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [inqRes.first_name, inqRes.last_name, roleResult[j].id, managerResult[i].id], function (err, result) {
                                            if (err) throw err;
                                            console.log('Success!');
                                            sFile.mainMenu();
                                        });
                                    };
                                };
                            };
                        };
                    };
                });
            });
        });
    };

    function updateEmployeeInfo() {

        var employeeList = [];

        sFile.connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, employee.manager_id FROM employee INNER JOIN role ON (employee.role_id = role.id) ORDER BY role.title', function (err, result) {
            if (err) throw err;

            var data = [];

            for (var i = 0; i < result.length; i++) {

                if (result[i].manager_id === 0) {
                    data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": "None" });
                };

                for (var k = 0; k < result.length; k++) {

                    if (result[i].manager_id === result[k].id) {
                        data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": result[k].first_name });
                    };
                };
            };

            for (var i = 0; i < result.length; i++) {
                employeeList.push(result[i].first_name + " " + result[i].last_name);
            };

            console.table(data);

            inquirer.prompt([
                {
                    name: "employeeChange",
                    type: "rawlist",
                    message: "Which employee would you like to change?",
                    choices: employeeList
                }
            ]).then(function (inqRes) {
                inquirer.prompt([
                    {
                        name: "employeeInfoChange",
                        type: "rawlist",
                        message: "What would you like to change about the employee?",
                        choices: [
                            "First Name",
                            "Last Name",
                            "Role",
                            "Manager"
                        ],
                    }
                ]).then(function (inqRes2) {
                    if (inqRes2.employeeInfoChange === "First Name") {
                        inquirer.prompt([
                            {
                                name: "firstNameChange",
                                type: "input",
                                message: "What would you like to change the employee's first name to?",
                            }
                        ]).then(function (inqRes3) {

                            for (var i = 0; i < result.length; i++) {

                                if (result[i].first_name + " " + result[i].last_name === inqRes.employeeChange) {

                                    sFile.connection.query("UPDATE employee SET first_name = ? WHERE id = ?", [inqRes3.firstNameChange, result[i].id], function (err, res) {
                                        if (err) throw err;
                                        console.log('Success!');
                                        sFile.mainMenu();
                                    });
                                };
                            };
                        });

                    } else if (inqRes2.employeeInfoChange === "Last Name") {

                        inquirer.prompt([
                            {
                                name: "lastNameChange",
                                type: "input",
                                message: "What would you like to change the employee's last name to?"
                            }
                        ]).then(function (inqRes3) {

                            for (var i = 0; i < result.length; i++) {

                                if (result[i].first_name + " " + result[i].last_name === inqRes.employeeChange) {

                                    sFile.connection.query("UPDATE employee SET last_name = ? WHERE id = ?", [inqRes3.lastNameChange, result[i].id], function (err, res) {
                                        if (err) throw err;
                                        console.log('Success!');
                                        sFile.mainMenu();
                                    });
                                };
                            };
                        });

                    } else if (inqRes2.employeeInfoChange === "Role") {

                        var roleArrayList = [];

                        sFile.connection.query("SELECT * FROM role", function (err, roleResult) {
                            if (err) throw err;

                            for (var i = 0; i < roleResult.length; i++) {
                                roleArrayList.push(roleResult[i].title);
                            };

                            inquirer.prompt([
                                {
                                    name: "roleChange",
                                    type: "rawlist",
                                    message: "What role would you like to switch the employee to?",
                                    choices: roleArrayList
                                }
                            ]).then(function (inqRes3) {

                                for (var i = 0; i < result.length; i++) {

                                    if (result[i].first_name + " " + result[i].last_name === inqRes.employeeChange) {

                                        for (var j = 0; j < roleResult.length; j++) {

                                            if (inqRes3.roleChange === roleResult[j].title) {

                                                sFile.connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [roleResult[j].id, result[i].id], function (err, res) {
                                                    if (err) throw err;
                                                    console.log('Success!');
                                                    sFile.mainMenu();
                                                });
                                            };
                                        };
                                    };
                                };
                            });
                        });

                    } else if (inqRes2.employeeInfoChange === "Manager") {

                        var managerArrayList = ["None"];

                        sFile.connection.query("SELECT employee.id, employee.first_name FROM employee INNER JOIN role ON (employee.role_id = role.id AND role.title = ?)", ["Manager"], function (err, managerResult) {
                            if (err) throw err;

                            for (var i = 0; i < managerResult.length; i++) {
                                managerArrayList.push(managerResult[i].first_name);
                            };

                            inquirer.prompt([
                                {
                                    name: "managerChange",
                                    type: "rawlist",
                                    message: "Which manager is the employee being put under?",
                                    choices: managerArrayList
                                }
                            ]).then(function (inqRes3) {

                                for (var j = 0; j < managerResult.length; j++) {

                                    if (inqRes3.managerChange === "None") {
                                        for (var i = 0; i < result.length; i++) {

                                            if (result[i].first_name + " " + result[i].last_name === inqRes.employeeChange) {

                                                sFile.connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [0, result[i].id], function (err, res) {
                                                    if (err) throw err;
                                                    console.log('Success!');
                                                    sFile.mainMenu();
                                                });
                                            };
                                        };

                                    } else if (inqRes3.managerChange === managerResult[j].first_name) {

                                        for (var i = 0; i < result.length; i++) {

                                            if (result[i].first_name + " " + result[i].last_name === inqRes.employeeChange) {

                                                sFile.connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [managerResult[j].id, result[i].id], function (err, res) {
                                                    if (err) throw err;
                                                    console.log('Success!');
                                                    sFile.mainMenu();
                                                });
                                            };
                                        };
                                    };
                                };
                            });
                        });
                    };
                });
            });
        });
    };

    function deleteEmployee() {

        sFile.connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, employee.manager_id FROM employee INNER JOIN role ON (employee.role_id = role.id) ORDER BY role.title', function (err, result) {
            if (err) throw err;

            var data = [];
            var employeeList = [];

            for (var i = 0; i < result.length; i++) {

                if (result[i].manager_id === 0) {
                    data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": "None" });
                } else if (result[i].manager_id !== 0) {

                    for (var k = 0; k < result.length; k++) {

                        if (result[i].manager_id === result[k].id) {
                            data.push({ "First Name": result[i].first_name, "Last Name": result[i].last_name, "Position": result[i].title, "Manager": result[k].first_name });
                        };
                    };
                };
            };
            console.table(data);

            for (var i = 0; i < result.length; i++) {
                employeeList.push(result[i].first_name + " " + result[i].last_name);
            };

            inquirer.prompt([
                {
                    name: "deleteEmployee",
                    type: "rawlist",
                    message: "Which employee would you like to remove?",
                    choices: employeeList
                }
            ]).then(function (inqRes) {

                for (var i = 0; i < result.length; i++) {

                    if (result[i].first_name + " " + result[i].last_name === inqRes.deleteEmployee) {

                        sFile.connection.query("DELETE FROM employee WHERE id = ?", [result[i].id], function (err, res) {
                            if (err) throw err;
                            console.log('Success!');
                            sFile.mainMenu();
                        });
                    };
                };
            })
        });
    };


    this.departments = function () {

        inquirer.prompt({
            name: 'action',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'View department list',
                'Add a department',
                'Update department info',
                'Delete a department',
                'Return to main menu'
            ]
        }).then(function (choice) {
            switch (choice.action) {
                case 'View department list':
                    viewDepartments();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Update department info':
                    updateDepartmentInfo();
                    break;
                case 'Delete a department':
                    deleteDepartment();
                    break;
                case 'Return to main menu':
                    sFile.mainMenu();
                    break;
            };
        });

        function viewDepartments() {

            inquirer.prompt({
                name: 'list',
                type: 'rawlist',
                message: 'What department list would you like to view?',
                choices: [
                    'View entire department list',
                    'View employees combined salary by department',
                    'Return to previous menu'
                ]
            }).then(function (inqRes) {
                switch (inqRes.list) {
                    case 'View entire department list':
                        viewAllDepartments();
                        break;
                    case 'View employees combined salary by department':
                        viewTotalSalary();
                        break;
                    case 'Return to main menu':
                        sFile.mainMenu();
                        break;
                };

                function viewAllDepartments() {

                    sFile.connection.query('SELECT department.name FROM department', function (err, result) {
                        if (err) throw err;
                        var data = [];

                        for (var i = 0; i < result.length; i++) {

                            data.push({ "Department": result[i].name });
                        };
                        console.table(data);
                        sFile.mainMenu();
                    });
                };

                function viewTotalSalary() {

                    var departmentList = [];

                    sFile.connection.query('SELECT * FROM department', function (err, result) {
                        if (err) throw err;

                        for (var i = 0; i < result.length; i++) {
                            departmentList.push(result[i].name);
                        };

                        inquirer.prompt([
                            {
                                name: "departmentName",
                                type: "rawlist",
                                message: "Which department would you like to view the total salary budget for?",
                                choices: departmentList
                            }
                        ]).then(function (inqRes) {

                            sFile.connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name FROM employee INNER JOIN (role, department) ON (department.name = ? AND department.id = role.department_id AND role.id = employee.role_id)', [inqRes.departmentName], function (err, result2) {
                                if (err) throw err;

                                var combinedSalary = result2.length * result2[0].salary;
                                console.log("There are " + result2.length + " employees currently at $" + result2[0].salary + " annually. The total comes to $" + combinedSalary + " for the " + inqRes.departmentName + " department.")
                                sFile.mainMenu();
                            });
                        });
                    });
                };
            });
        };

        function addDepartment() {

            inquirer.prompt([
                {
                    name: "departmentName",
                    type: "input",
                    message: "What is the department name?"
                }
            ]).then(function (inqRes) {

                sFile.connection.query("INSERT INTO department (name) VALUES (?)", [inqRes.departmentName], function (err, result) {
                    if (err) throw err;
                    console.log('Success!');
                    sFile.mainMenu();
                });
            });
        };

        function updateDepartmentInfo() {

            sFile.connection.query('SELECT * FROM department', function (err, result) {
                if (err) throw err;

                var data = [];
                var departmentList = [];

                for (var i = 0; i < result.length; i++) {
                    data.push({ "Department": result[i].name });
                };

                for (var i = 0; i < result.length; i++) {
                    departmentList.push(result[i].name);
                };

                console.table(data);

                inquirer.prompt([
                    {
                        name: "departmentChange",
                        type: "rawlist",
                        message: "Which department would you like to change?",
                        choices: departmentList
                    }
                ]).then(function (inqRes) {
                    inquirer.prompt([
                        {
                            name: "departmentNameChange",
                            type: "input",
                            message: "What would you like to change the department name to?",
                        }
                    ]).then(function (inqRes2) {

                        for (var i = 0; i < result.length; i++) {

                            if (inqRes.departmentChange === result[i].name) {

                                sFile.connection.query("UPDATE department SET name = ? WHERE id = ?", [inqRes2.departmentNameChange, result[i].id], function (err, res) {
                                    if (err) throw err;
                                    console.log('Success!');
                                    sFile.mainMenu();
                                });
                            };
                        };
                    });
                });
            });
        };

        function deleteDepartment() {

            sFile.connection.query('SELECT * FROM department', function (err, result) {
                if (err) throw err;
                var data = [];
                var departmentList = [];

                for (var i = 0; i < result.length; i++) {

                    data.push({ "Department": result[i].name });
                };

                for (var i = 0; i < result.length; i++) {
                    departmentList.push(result[i].name);
                };

                console.table(data);

                inquirer.prompt([
                    {
                        name: "deleteDepartment",
                        type: "rawlist",
                        message: "Which department would you like to remove?",
                        choices: departmentList
                    }
                ]).then(function (inqRes) {

                    for (var i = 0; i < result.length; i++) {

                        if (result[i].name === inqRes.deleteDepartment) {

                            sFile.connection.query("DELETE FROM department WHERE id = ?", [result[i].id], function (err, res) {
                                if (err) throw err;
                                console.log('Success!');
                                sFile.mainMenu();
                            });
                        };
                    };
                })
            });
        };
    };


    this.roles = function () {

        inquirer.prompt({
            name: 'action',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'View roles list',
                'Add a role',
                'Update role info',
                'Delete a role',
                'Return to main menu'
            ]
        }).then(function (choice) {
            switch (choice.action) {
                case 'View roles list':
                    viewRoles();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Update role info':
                    updateRoleInfo();
                    break;
                case 'Delete a role':
                    deleteRole();
                    break;
                case 'Return to main menu':
                    sFile.mainMenu();
                    break;
            };
        });

        function viewRoles() {

            sFile.connection.query('SELECT role.title, role.salary, department.name FROM role INNER JOIN department ON (role.department_id = department.id) ORDER BY role.title', function (err, result) {
                if (err) throw err;

                var data = [];

                for (var i = 0; i < result.length; i++) {

                    data.push({ "Title": result[i].title, "Salary": result[i].salary, "Department": result[i].name });
                };
                console.table(data);
                sFile.mainMenu();
            });
        };

        function addRole() {

            var departmentArray = [];

            sFile.connection.query("SELECT * FROM department", function (err, departmentResult) {
                if (err) throw err;

                for (var i = 0; i < departmentResult.length; i++) {
                    departmentArray.push(departmentResult[i].name);
                };

                inquirer.prompt([
                    {
                        name: "title",
                        type: "input",
                        message: "What is the name of the role?"
                    },
                    {
                        name: "salary",
                        type: "number",
                        message: "Enter the annual salary in numbers only."
                    },
                    {
                        name: "departmentId",
                        type: "rawlist",
                        message: "What department does this role belong to?",
                        choices: departmentArray
                    }
                ]).then(function (inqRes) {

                    for (var i = 0; i < departmentResult.length; i++) {

                        if (departmentResult[i].name === inqRes.departmentId) {

                            sFile.connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [inqRes.title, parseInt(inqRes.salary), departmentResult[i].id], function (err, result) {
                                if (err) throw err;
                                console.log('Success!');
                                sFile.mainMenu();
                            });
                        };
                    };

                });
            });
        };

        function updateRoleInfo() {

            sFile.connection.query('SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON (role.department_id = department.id) ORDER BY role.title', function (err, result) {
                if (err) throw err;

                var data = [];
                var roleList = [];

                for (var i = 0; i < result.length; i++) {

                    data.push({ "Title": result[i].title, "Salary": result[i].salary, "Department": result[i].name });
                };

                for (var i = 0; i < result.length; i++) {
                    roleList.push(result[i].title);
                };

                console.table(data);

                inquirer.prompt([
                    {
                        name: "roleChange",
                        type: "rawlist",
                        message: "Which role would you like to change?",
                        choices: roleList
                    }
                ]).then(function (inqRes) {
                    inquirer.prompt([
                        {
                            name: "roleInfoChange",
                            type: "rawlist",
                            message: "What would you like to change about the role?",
                            choices: [
                                "Title",
                                "Salary",
                                "Department"
                            ],
                        }
                    ]).then(function (inqRes2) {
                        if (inqRes2.roleInfoChange === "Title") {
                            inquirer.prompt([
                                {
                                    name: "titleChange",
                                    type: "input",
                                    message: "What would you like to change the role's title to?",
                                }
                            ]).then(function (inqRes3) {

                                for (var i = 0; i < result.length; i++) {

                                    if (result[i].title === inqRes.roleChange) {

                                        sFile.connection.query("UPDATE role SET title = ? WHERE id = ?", [inqRes3.titleChange, result[i].id], function (err, res) {
                                            if (err) throw err;
                                            console.log('Success!');
                                            sFile.mainMenu();
                                        });
                                    };
                                };
                            });

                        } else if (inqRes2.roleInfoChange === "Salary") {
                            inquirer.prompt([
                                {
                                    name: "salaryChange",
                                    type: "number",
                                    message: "Please enter the annual salary in numbers only."
                                }
                            ]).then(function (inqRes3) {

                                for (var i = 0; i < result.length; i++) {

                                    if (result[i].title === inqRes.roleChange) {

                                        sFile.connection.query("UPDATE role SET salary = ? WHERE id = ?", [inqRes3.salaryChange, result[i].id], function (err, res) {
                                            if (err) throw err;
                                            console.log('Success!');
                                            sFile.mainMenu();
                                        });
                                    };
                                };
                            });

                        } else if (inqRes2.roleInfoChange === "Department") {

                            var departmentList = [];

                            sFile.connection.query('SELECT * FROM department', function (err, result2) {
                                if (err) throw err;

                                for (var i = 0; i < result2.length; i++) {
                                    departmentList.push(result2[i].name);
                                };

                                inquirer.prompt([
                                    {
                                        name: "departmentChange",
                                        type: "rawlist",
                                        message: "What department would you like to switch the role to?",
                                        choices: departmentList
                                    }
                                ]).then(function (inqRes3) {

                                    for (var i = 0; i < result.length; i++) {

                                        if (result[i].title === inqRes.roleChange) {

                                            for (var j = 0; j < result2.length; j++) {

                                                if (result2[j].name === inqRes3.departmentChange) {

                                                    sFile.connection.query("UPDATE role SET department_id = ? WHERE id = ?", [result2[j].id, result[i].id], function (err, res) {
                                                        if (err) throw err;
                                                        console.log('Success!');
                                                        sFile.mainMenu();
                                                    });
                                                };
                                            };
                                        };
                                    };
                                });
                            });
                        };
                    });
                });
            });
        };

        function deleteRole() {

            sFile.connection.query('SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON (role.department_id = department.id) ORDER BY role.title', function (err, result) {
                if (err) throw err;

                var data = [];
                var roleList = [];

                for (var i = 0; i < result.length; i++) {

                    data.push({ "Title": result[i].title, "Salary": result[i].salary, "Department": result[i].name });
                };

                for (var i = 0; i < result.length; i++) {
                    roleList.push(result[i].name);
                };

                console.table(data);

                inquirer.prompt([
                    {
                        name: "deleteRole",
                        type: "rawlist",
                        message: "Which role would you like to remove?",
                        choices: roleList
                    }
                ]).then(function (inqRes) {

                    for (var i = 0; i < result.length; i++) {

                        if (result[i].name === inqRes.deleteRole) {

                            sFile.connection.query("DELETE FROM role WHERE id = ?", [result[i].id], function (err, res) {
                                if (err) throw err;
                                console.log('Success!');
                                sFile.mainMenu();
                            });
                        };
                    };
                })
            });
        };
    };
};


module.exports = Functions;
