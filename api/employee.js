const express = require('express');
const sqlite3 = require('sqlite3');
const employeeRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(
        'SELECT * FROM Employee WHERE id = $id', 
        {
            $id: employeeId
        }, 
        (err, employee) => {
            if(err) {
                next(err);
            } else if(employee) {
                req.employee = employee;
                next();
            } else {
                res.sendStatus(404);
            };
        }
    );
});

employeeRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM Employee WHERE is_current_employee = 1', 
        (err, employees) => {
            if(err) {
                next(err);
            } else {
                res.status(200).json({ employees: employees})
            };
        }
    );
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee });
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name; 
    const position = req.body.employee.position;
    const wage = req.body.employee.wage

    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1; 
    
    if(!name || !position || !wage) {
        res.sendStatus(400);
    };

    db.run(
        'INSERT INTO Employee (name, position, wage, is_current_employee) ' + 
        'VALUES ($name, $position, $wage, $isCurrentEmployee);',
        {
            $name: name, 
            $position: position, 
            $wage: wage, 
            $isCurrentEmployee: isCurrentEmployee
        },
        function(err) {
            if(err) {
                next(err);
            } else {
                db.get(
                    `SELECT * FROM Employee WHERE id = ${this.lastID}`, 
                    (err, employee) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(201).json({ employee: employee });
                        };
                    } 
                );
            };
        }
    );

});



module.exports = employeeRouter; 