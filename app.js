const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const server = app.listen(3000, function() {});

const getPool = (connectNum, host, user, password, database) => {
    return {connectionLimit: connectNum, host: host, user: user, password: password, database: database}
}
const getPoolModelForBThreeTest = (connectNum) => {
    return getPool(connectNum, '', 'root', '', '');
}
const getPoolModelForBThreeUsing = (connectNum) => {
    return getPool(connectNum, '', 'root', '', '');
}

app.post('/user/add', (req, res) => {
    let user = req.body,
        keyData = null,
        //TODO..
        pool = mysql.createPool(getPoolModelForBThreeUsing(5));

    console.log(user);
    if (user.gu != undefined && user.gp != undefined && user.key != undefined) {
        pool.getConnection((err, connection) => {
            connection.query('SELECT * FROM user_test WHERE `gu` = ?', [user.gu], (err, results, fields) => {
                connection.release();
                if (err) {
                    throw err;
                }
                if (results.length == 0) {
                    pool.getConnection((err, connection) => {
                        connection.query('SELECT * FROM keys_test WHERE `keyname` = ?', [user.key], (err, results, fields) => {
                            connection.release();
                            if (err) {
                                throw err;
                            }
                            if (results.length == 0) {
                                res.send('invalid key')
                                res.end();
                            } else {
                                if (results[0].keycount > 0) {
                                    keyData = results[0];
                                    pool.getConnection((err, connection) => {
                                        connection.query('UPDATE keys_test SET `keycount` = ? WHERE `keyname` = ?', [
                                            --keyData.keycount,
                                            keyData.keyname
                                        ], (err, fields) => {
                                            if (err) {
                                                throw err;
                                            }
                                        })
                                    })
                                    pool.getConnection((err, connection) => {
                                        connection.query('INSERT INTO user_test SET ?', [user], (err, fields) => {
                                            if (err) {
                                                throw err;
                                            }
                                        })
                                    })
                                    res.send('success');
                                    res.end();
                                } else {
                                    res.send('key already full');
                                    res.end();
                                }
                            }
                        });
                    });
                } else {
                    res.send('user already exist');
                    res.end();
                }
            });
        });
    }
});

app.post('/key/:keyname', (req, res) => {
    let pool = mysql.createPool(getPoolModelForBThreeUsing(1));
    pool.getConnection((err, connection) => {
        connection.query('SELECT * FROM user_test WHERE `key` = ?', [req.params.keyname], (err, results, fields) => {
            connection.release();
            if (err) {
                throw err;
            }
            if (results.length == 0) {
                res.send('invalid key');
                res.end();
            } else {
                res.send('already bound ' + results.length + ' player');
                res.end();
            }
        })
    })
});
