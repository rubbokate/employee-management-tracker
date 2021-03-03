const inquirer = require("inquirer");
const cTable = require("console.table");
const helperFuncs = require("./db/helperFuncs");
const connection = require("./db/connection");

// function which prompts user to select an action
async function start() {
  await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: ["View all employees", "View all employees by department", "View all employees by manager", "Add employee", "Remove employee", "Update employee role", "Update employee manager", "View all roles", "Add role", "Remove role", "View all departments", "Add department", "Remove department", "Exit"]
    }
  ]).then(function (answer) {
    // based on their answer, call corresponding function
    switch (answer.action) {
      case "View all employees":
        queryAllEmployees();
        break;
      case "View all employees by department":
        queryAllEmployeesByDept();
        break;
      case "View all employees by manager":
        queryAllEmployeesByMgr();
        break;
      case "Add employee":
        addEmployee();
        break;
      case "Remove employee":
        removeEmployee();
        break;
      case "Update employee role":
        updateEmployeeRole();
        break;
      case "Update employee manager":
        updateEmployeeMgr();
        break;
      case "View all roles":
        queryAllRoles();
        break;
      case "Add role":
        addRole();
        break;
      case "Remove role":
        removeRole();
        break;
      case "View all departments":
        queryAllDepartments();
        break;
      case "Add department":
        addDepartment();
        break;
      case "Remove department":
        removeDepartment();
        break;
      case "Exit":
        connection.end();
        break;
      default:
        connection.end();
    }
  });
}

async function convertMgrIdtoName(res) {
  const employees = await helperFuncs.empTable();
  res.forEach(element => {
    for(let i = 0; i < employees.length; i++) {
      if(element.manager === employees[i].id) {
        element.manager = employees[i].first_name + " " + employees[i].last_name;
      }
    }
  })
  return res;
}

async function queryAllEmployees() {
  const table = await helperFuncs.fullTable();
  const newTable = await convertMgrIdtoName(table);
  console.table(newTable);
  // return to start function for next action
  start();
}

async function queryAllEmployeesByDept() {
  const depts = await helperFuncs.deptTable();
  const deptChoices = depts.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const answer = await inquirer.prompt(
    {
      name: "departmentSelection",
      type: "list",
      message: "Which department would you like to view?",
      choices: deptChoices
    }
  )
  const res = await helperFuncs.empByDept(answer.departmentSelection);
  const newRes = await convertMgrIdtoName(res);
  console.table(newRes);
  start();
  
}

async function queryAllEmployeesByMgr() {
  const employees = await helperFuncs.empTable();
  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const answer = await inquirer.prompt([
    {
      name: "mgrSelection",
      type: "list",
      message: "Which manager's employees would you like to view?",
      choices: managerChoices
    }
  ])
  const res = await helperFuncs.fullTable();
     
  let employeesByMgr = [];

  for (let i = 0; i < res.length; i++) {
    if (res[i].manager === answer.mgrSelection) {
      employeesByMgr.push(res[i]);
    }
  }
  const newTable = await convertMgrIdtoName(employeesByMgr);
  console.table(newTable);
  start();
}

async function addEmployee() {
  const roles = await helperFuncs.roleTable();
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const employees = await helperFuncs.empTable();
  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  managerChoices.unshift({ name: "None", value: null });

  inquirer.prompt([
    {
      name: "firstName",
      type: "input",
      message: "What is the employee's first name?"
    },
    {
      name: "lastName",
      type: "input",
      message: "What is the employee's last name?"
    },
    {
      name: "roleSelection",
      type: "list",
      message: "Which role will the employee have?",
      choices: roleChoices
    },
    {
      name: "mgrSelection",
      type: "list",
      message: "Who will be the employee's manager?",
      choices: managerChoices
    }
  ])
    .then(function (answers) {
      connection.query("INSERT INTO employee SET ?",
        {
          first_name: answers.firstName,
          last_name: answers.lastName,
          role_id: answers.roleSelection,
          manager_id: answers.mgrSelection
        },
        function (err, res) {
          if (err) throw err;
          console.log("New employee added!");
          start();
        })
    });
}

async function removeEmployee() {
  const emps = await helperFuncs.empTable();
  const empChoices = emps.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  inquirer.prompt([
    {
      name: "empSelection",
      type: "list",
      message: "Which employee would you like to remove?",
      choices: empChoices
    }
  ]).then(function (answers) {
    connection.query("DELETE FROM employee WHERE id = ?", [answers.empSelection], function (err, res) {
      if (err) throw (err);
      console.log("Employee removed!");
      start();
    });
  });
}

async function updateEmployeeRole() {
  const employees = await helperFuncs.empTable();
  const empChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const roles = await helperFuncs.roleTable();
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  inquirer.prompt([
    {
      name: "empSelection",
      type: "list",
      message: "Which employee would you like to edit?",
      choices: empChoices
    },
    {
      name: "roleSelection",
      type: "list",
      message: "What is the new role?",
      choices: roleChoices
    }
  ]).then(function (answers) {
    connection.query("UPDATE employee SET ? WHERE ?",
      [
        {
          role_id: answers.roleSelection
        },
        {
          id: answers.empSelection
        }
      ],
      function (err, res) {
        if (err) throw (err);
        console.log("Employee role updated!");
        start();
      }
    );
  });
}

async function updateEmployeeMgr() {
  const employees = await helperFuncs.empTable();
  const empChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  const mgrChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  mgrChoices.unshift({ name: "None", value: null });

  inquirer.prompt([
    {
      name: "empSelection",
      type: "list",
      message: "Which employee would you like to edit?",
      choices: empChoices
    },
    {
      name: "mgrSelection",
      type: "list",
      message: "Who is the new manager assigned?",
      choices: mgrChoices
    }
  ]).then(function (answers) {
    connection.query("UPDATE employee SET ? WHERE ?",
      [
        {
          manager_id: answers.mgrSelection
        },
        {
          id: answers.empSelection
        }
      ],
      function (err, res) {
        if (err) throw (err);
        console.log("Employee manager updated!");
        start();
      }
    );
  });
}

function queryAllRoles() {
  connection.query("SELECT role.id, role.title, role.salary, department.name AS department FROM department INNER JOIN role ON department.id = role.department_id", function (err, res) {
    console.table(res);
    start();
  });
}

async function addRole() {
  const depts = await helperFuncs.deptTable();
  const deptChoices = depts.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  inquirer.prompt([
    {
      name: "roleTitle",
      type: "input",
      message: "What is the name of the new role?"
    },
    {
      name: "roleSalary",
      type: "input",
      message: "What will the salary be?"
    },
    {
      name: "deptSelection",
      type: "list",
      message: "Which department will this role be a part of?",
      choices: deptChoices
    }
  ]).then(function (answers) {
    connection.query("INSERT INTO role SET ?",
      {
        title: answers.roleTitle,
        salary: answers.roleSalary,
        department_id: answers.deptSelection
      }
      , function (err, res) {
        if (err) throw (err);
        console.log("Role added!");
        start();
      });
  });
}

async function removeRole() {
  const roles = await helperFuncs.roleTable();
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  inquirer.prompt([
    {
      name: "roleSelection",
      type: "list",
      message: "Which role would you like to remove?",
      choices: roleChoices
    }
  ]).then(function (answers) {
    connection.query("DELETE FROM role WHERE id = ?", [answers.roleSelection]
      , function (err, res) {
        if (err) throw (err);
        console.log("Role removed!");
        start();
      });
  });
}

function queryAllDepartments() {
  connection.query("SELECT id, name AS department FROM department", function (err, res) {
    console.table(res);
    start();
  });
}

function addDepartment() {
  inquirer.prompt([
    {
      name: "deptName",
      type: "input",
      message: "What is the name of the new department?"
    }
  ]).then(function (answers) {
    connection.query("INSERT INTO department SET ?",
      {
        name: answers.deptName
      },
      function (err, res) {
        if (err) throw (err);
        console.log("Department added!");
        start();
      })
  })
}

async function removeDepartment() {
  const depts = await helperFuncs.deptTable();
  const deptChoices = depts.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  inquirer.prompt([
    {
      name: "deptSelection",
      type: "list",
      message: "Which department would you like to remove?",
      choices: deptChoices
    }
  ]).then(function (answers) {
    connection.query("DELETE FROM department WHERE id = ?", [answers.deptSelection]
      , function (err, res) {
        if (err) throw (err);
        console.log("Department removed!");
        start();
      });
  });
}

// Begin app
start();