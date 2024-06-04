const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Create connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'root', // Replace with your MySQL password
  database: 'company_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
  mainMenu();
});

// Main menu
function mainMenu() {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ]
  }).then(answer => {
    switch (answer.action) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        connection.end();
        break;
    }
  });
}

function viewAllDepartments() {
  const query = 'SELECT * FROM department';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

function viewAllRoles() {
  const query = `SELECT role.id, role.title, department.name AS department, role.salary
                 FROM role
                 LEFT JOIN department ON role.department_id = department.id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
                 CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                 FROM employee
                 LEFT JOIN role ON employee.role_id = role.id
                 LEFT JOIN department ON role.department_id = department.id
                 LEFT JOIN employee manager ON manager.id = employee.manager_id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

function addDepartment() {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  }).then(answer => {
    const query = 'INSERT INTO department (name) VALUES (?)';
    connection.query(query, answer.name, (err, res) => {
      if (err) throw err;
      console.log('Department added successfully!');
      mainMenu();
    });
  });
}

function addRole() {
  inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'Enter the title of the role:'
    },
    {
      name: 'salary',
      type: 'input',
      message: 'Enter the salary of the role:'
    },
    {
      name: 'department_id',
      type: 'input',
      message: 'Enter the department ID this role belongs to:'
    }
  ]).then(answers => {
    const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
    connection.query(query, [answers.title, answers.salary, answers.department_id], (err, res) => {
      if (err) throw err;
      console.log('Role added successfully!');
      mainMenu();
    });
  });
}

function addEmployee() {
  inquirer.prompt([
    {
      name: 'first_name',
      type: 'input',
      message: 'Enter the first name of the employee:'
    },
    {
      name: 'last_name',
      type: 'input',
      message: 'Enter the last name of the employee:'
    },
    {
      name: 'role_id',
      type: 'input',
      message: 'Enter the role ID of the employee:'
    },
    {
      name: 'manager_id',
      type: 'input',
      message: 'Enter the manager ID of the employee (if any):'
    }
  ]).then(answers => {
    const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
    connection.query(query, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (err, res) => {
      if (err) throw err;
      console.log('Employee added successfully!');
      mainMenu();
    });
  });
}

function updateEmployeeRole() {
  inquirer.prompt([
    {
      name: 'employee_id',
      type: 'input',
      message: 'Enter the ID of the employee you want to update:'
    },
    {
      name: 'role_id',
      type: 'input',
      message: 'Enter the new role ID for the employee:'
    }
  ]).then(answers => {
    const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
    connection.query(query, [answers.role_id, answers.employee_id], (err, res) => {
      if (err) throw err;
      console.log('Employee role updated successfully!');
      mainMenu();
    });
  });
}
