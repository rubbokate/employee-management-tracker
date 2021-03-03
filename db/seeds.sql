select * from department;

insert into department (name)
values ("Engineering"), ("Sales"), ("Finance"), ("Legal");

select * from department;

select * from role;

insert into role (title, salary, department_id)
values ("Software Engineer", 120000, 1), ("Lead Engineer", 150000, 1), 
("Sales Person", 80000, 2), ("Sales Lead", 100000, 2),
("Accountant", 125000, 3), 
("Lawyer", 190000, 4), ("Legal Team Lead", 250000, 4);

select * from role;

select * from employee;

insert into employee (first_name, last_name, role_id)
values ("Kassi", "Stumb", 2);

insert into employee (first_name, last_name, role_id)
values ("Aaron", "Stumb", 6);

insert into employee (first_name, last_name, role_id, manager_id)
values ("Austin", "Stumb", 1, 1);

select * from employee;
