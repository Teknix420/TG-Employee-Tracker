// You may wish to have a separate file containing functions for performing specific SQL queries you'll need to use. Could a constructor function or a class be helpful for organizing these?

// You will need to perform a variety of SQL JOINS to complete this assignment, and it's recommended you review the week's activities if you need a refresher on this.

const mysql = require('mysql');
const inquirer = require('inquirer');
const Functions = require('./functions/functions');
const fPage = new Functions();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'fishsticks420',
    database: 'employee_tracker_db'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected');
    mainMenu();
});

function mainMenu() {

    inquirer.prompt({
        name: 'section',
        type: 'rawlist',
        message: 'Which section would you like to modify?',
        choices: [
            "Employees",
            "Departments",
            "Roles"
        ]
    }).then(function (res) {

        if (res.section === "Employees") {
            fPage.employees();
        } else if (res.section === "Departments") {
            fPage.departments();
        } else if (res.section === "Roles") {
            fPage.roles();
        };
    });
};

exports.mainMenu = mainMenu;
exports.connection = connection;