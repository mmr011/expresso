const express = require('express'); 
const sqlite3 = require('sqlite3');
const timesheetRouter = express.Router({ mergeParams: true })
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get(
        'SELECT * FROM Timesheet WHERE id = $timesheetId', 
        {
            $timesheetId: timesheetId
        }, 
        (err, timesheet) => {
            if(err) {
                next(err);
            } else if(timesheet) {
                req.timesheet = timesheet;
                next();
            } else {
                res.sendStatus(404);
            };
        }
    );
});

timesheetRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM Timesheet WHERE employee_id = $employeeId', 
        {
            $employeeId: req.params.employeeId
        },
        (err, timesheets) => {
            if(err) {
                next(err);
            } else {
                res.status(200).json({ timesheets: timesheets });
            };
        }
    );
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours; 
    const rate = req.body.timesheet.rate; 
    const date = req.body.timesheet.date;

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    };

    db.run(
        'INSERT INTO Timesheet (hours, rate, date, employee_id) ' + 
        'VALUES ($hours, $rate, $date, $employeeId)',
        {
            $hours: hours, 
            $rate: rate, 
            $date: date, 
            $employeeId: req.params.employeeId
        },
        function(err) {
            if(err) {
                next(err);
            } else {
                db.get(
                    `SELECT * FROM Timesheet WHERE id = ${this.lastID}`, 
                    (err, newTimesheet) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(201).json({ timesheet: newTimesheet });
                        };
                    }
                );
            };
        }
    );
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours; 
    const rate = req.body.timesheet.rate; 
    const date = req.body.timesheet.date;

    db.get(
        'SELECT * FROM Employee WHERE id = $employeeId', 
        {
            $employeeId: req.params.employeeId
        }, 
        (err, employee) => {
            if(err) {
                next(err);
            } else {
                if(!hours || !rate || !date || !employee) {
                    res.sendStatus(400);
                }  else {
                    db.run(
                        `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId`, 
                        {
                            $hours: hours, 
                            $rate: rate, 
                            $date: date, 
                            $employeeId: req.params.employeeId, 
                            $timesheetId: req.params.timesheetId
                        }, 
                        (err) => {
                            if(err) {
                                next(err);
                            } else {
                                db.get(
                                    `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
                                    (err, updatedTimesheet) => {
                                        if(err) {
                                            next(err);
                                        } else {
                                            res.status(200).json({ timesheet: updatedTimesheet });
                                        }
                                    } 
                                )
                            }
                        }
                    )                    
                };
            };
        }
    );
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(
        'DELETE FROM Timesheet WHERE id = $timesheetId', 
        {
            $timesheetId: req.params.timesheetId
        },
        (err) => {
            if(err) {
                next(err);
            } else {
                res.sendStatus(204);
            }
        }
    )
});

module.exports = timesheetRouter; 