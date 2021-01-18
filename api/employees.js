const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


// Param
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const placeholders = {$employeeId: employeeId};
    db.get(sql, placeholders, (err, row) => {
        if(err){
            next(err);
        } else if(!row) {
            res.sendStatus(404);
        } else {
            req.employee = employeeId;
            next();
        }
    });   
});

// Handling '/' requests
employeesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            // Create empoyees property on res.body and populate it with rows from SQL results
            // Send with status 200
            res.status(200).json({employees: rows});
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    console.log(req);
    
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee;

    if(name || position || wage || isCurrentEmployee) {
        res.sendStatus(400);
    } else {
        const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee)' +
        'VALUES ($name, $position, $wage, $isCurrentEmployee)';

        const placeholders = {
            $name: name, 
            $position: position, 
            $wage: wage, 
            $isCurrentEmployee: isCurrentEmployee
        };

        db.run(sql, placeholders, (err) => {
            if(err) {
                next(err);
            } else {
                db.get('SELECT * FROM Employee WHERE Employee.id = $id', {$id: this.lastID}, (err, row) => {
                    if(err){
                        next(err);
                    } else {
                        res.status(201).json({employee: row});
                    }
                });
            }
        });
    }
});

// Handling '/:employeeId' requests
employeesRouter.get('/:employeeId', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const placeholders = {$employeeId: req.employee};
    db.get(sql, placeholders, (err, row) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employee: row});
        }
    });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    
});

module.exports = employeesRouter;