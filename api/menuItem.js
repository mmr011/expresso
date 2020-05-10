const express = require('express'); 
const sqlite3 = require('sqlite3');
const menuItemRouter = express.Router({ mergeParams: true });
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(
        'SELECT * FROM MenuItem WHERE id = $menuItemId', 
        {
            $menuItemId: menuItemId
        },
        (err, menuItem) => {
            if(err) {
                next(err);
            } else if(menuItem) {
                req.menuItem = menuItem;
                next();
            } else {
                res.sendStatus(404);
            };
        }
    );
})

menuItemRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM MenuItem WHERE menu_id = $menuId', 
        {
            $menuId: req.params.menuId
        }, 
        (err, menuItems) => {
            if(err) {
                next(err);
            } else {
                res.status(200).json({ menuItems: menuItems });
            };
        }
    );
});

menuItemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name; 
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory; 
    const price = req.body.menuItem.price; 

    if(!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    };

    db.run(
        'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' + 
        'VALUES ($name, $description, $inventory, $price, $menuId)', 
        {
            $name: name, 
            $description: description, 
            $inventory: inventory, 
            $price: price, 
            $menuId: req.params.menuId
        }, 
        function(err) {
            if(err) {
                next(err);
            } else {
                db.get(
                    `SELECT * FROM MenuItem WHERE id = ${this.lastID}`, 
                    (err, newMenuItem) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(201).json({ menuItem: newMenuItem });
                        };
                    }
                );
            };
        }
    );
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name; 
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory; 
    const price = req.body.menuItem.price; 

    db.get(
        'SELECT * FROM Menu WHERE id = $menuId', 
        {
            $menuId: req.params.menuId
        }, 
        (err, menu) => {
            if(err) {
                next(err); 
            } else {
                if(!name || !description || !inventory || !price || !menu) {
                    res.sendStatus(400);
                } else {
                    db.run(
                        'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId', 
                        {
                            $name: name, 
                            $description: description, 
                            $inventory: inventory, 
                            $price: price, 
                            $menuId: req.params.menuId,
                            $menuItemId: req.params.menuItemId 
                        }, 
                        (err) => {
                            if(err) {
                                next(err);
                            } else {
                                db.get(
                                    `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, 
                                    (err, updatedMenuItem) => {
                                        if(err) {
                                            next(err);
                                        } else {
                                            res.status(200).json({ menuItem: updatedMenuItem });
                                        };
                                    }
                                );
                            };
                        }
                    );
                };
            };
        }
    );
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(
        'DELETE FROM MenuItem WHERE id = $menuItemId', 
        {
            $menuItemId: req.params.menuItemId
        }, 
        (err) => {
            if(err) {
                next(err);
            } else {
                res.sendStatus(204);
            };
        }
    );
});

module.exports = menuItemRouter;