const connection = require("./connection");

class Database {
  constructor(connection) {
    this.connection = connection;
  }

  roleTable = () => {
    return this.connection.query("SELECT * FROM role");
  }

  empTable = () => {
    return this.connection.query("SELECT * FROM employee");
  }

  deptTable = () => {
    return this.connection.query("SELECT * FROM department");
  }

  fullTable = () => {
    const queryAll = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id";
    return this.connection.query(queryAll + " ORDER BY employee.id");
  }

  empByDept = (deptId) => {
    const queryAll = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id";
    return this.connection.query(queryAll + " WHERE department.id = ? ORDER BY employee.id", [deptId]);
  }
}

module.exports = new Database(connection);