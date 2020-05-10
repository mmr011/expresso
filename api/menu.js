const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const menuItemRouter = require('./menuItem');

menuRouter.param('menuId', (req, res, next, menuId) => {
    db.get(
        'SELECT * FROM Menu WHERE id = $menuId', 
        {
            $menuId: menuId
        },
        (err, menu) => {
            if(err) {
                next(err);
            } else if(menu) {
                req.menu = menu; 
                next();
            } else {
                res.sendStatus(404);
            };
        }
    );
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM Menu', 
        (err, menus) => {
            if(err) {
                next(err);
            } else {
                res.status(200).json({ menus: menus });
            }
        }
    )
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu });
});

menuRouter.post('/', (req,res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    };

    db.run(
        'INSERT INTO Menu (title) VALUES ($title)', 
        {
            $title: title
        },
        function(err) {
            if(err) {
                next(err);
            } else {
                db.get(
                    `SELECT * FROM Menu WHERE id = ${this.lastID}`, 
                    (err, newMenu) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(201).json({ menu: newMenu });
                        };
                    }
                );
            };
        }
    );
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    }; 

    db.run(
        'UPDATE Menu SET title = $title WHERE id = $menuId', 
        {
            $title: title, 
            $menuId: req.params.menuId
        }, 
        (err) => {
            if(err) {
                next(err);
            } else {
                db.get(
                    `SELECT * FROM Menu WHERE id = ${req.params.menuId}`, 
                    (err, updatedMenu) => {
                        if(err) {
                            next(err); 
                        } else {
                            res.status(200).json({ menu: updatedMenu });
                        };
                    }
                );
            };
        }
    );
});

menuRouter.delete('/:menuId', (req, res, next) => {
    db.get(
        'SELECT * FROM MenuItem WHERE menu_id = $menuId', 
        {
            $menuId: req.params.menuId
        },
        (err, menu) => {
            if(err) {
                next(err);
            } else {
                if(menu) {
                   res.sendStatus(400); 
                } else {
                    db.run(
                        'DELETE FROM Menu WHERE id = $menuId', 
                        {
                            $menuId: req.params.menuId
                        }, 
                        (err) => {
                            if(err) {
                                next(err);
                            } else {
                                res.sendStatus(204);
                            }
                        }
                    )
                }
            }
        }
    )
});

module.exports = menuRouter; 