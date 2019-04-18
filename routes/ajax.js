var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var connection = mysql.createConnection(config.database);

router.post('/login', function (request, response, next) {
    let username = request.body.username;
    let password = request.body.password;
    if (username === config.admin.username && password === config.admin.password) {
        request.session.verified = true;
        response.sendStatus(204);
    } else {
        response.sendStatus(403);
    }
});

router.get('/verify', function (request, response, next) {
    if (request.session.verified) {
        response.sendStatus(204);
    } else {
        response.sendStatus(403);
    }
});

router.get('/logout', function (request, response, next) {
    if (request.session.verified) {
        request.session.destroy();
        response.sendStatus(204);
    } else {
        response.sendStatus(403);
    }
});

router.get('/article/list', function (request, response, next) {
    if (!request.session.verified) {
        response.sendStatus(403);
        response.end();
        return;
    }
    connection.query('SELECT id, title FROM article ORDER BY id DESC',
        function (error, results, fields) {
            if (error) {
                response.sendStatus(500);
                response.end();
                return;
            }
            let post_list = [];
            for (let i = 0; i < results.length; i++) {
                post_list.push(results[i]);
            }
            response.json(post_list);
        });
});


router.get('/article/delete/:id', function (request, response, next) {
    if (!request.session.verified) {
        response.sendStatus(403);
        response.end();
        return;
    }
    connection.query('DELETE FROM article WHERE id = ?', [parseInt(request.params.id)],
        function (error, results, fields) {
            if (error) {
                response.sendStatus(500);
                response.end();
                return;
            }
            response.sendStatus(204);
        });
});


router.get('/article/content/:id', function (request, response, next) {
    if (!request.session.verified) {
        response.sendStatus(403);
        response.end();
        return;
    }
    connection.query('SELECT * FROM article WHERE id = ?', [parseInt(request.params.id)],
        function (error, results, fields) {
            if (error) {
                response.sendStatus(500);
                response.end();
                return;
            }
            if (results.length === 0) {
                response.sendStatus(500);
                response.end();
                return;
            }
            response.json(results[0]);
        });
});

router.post('/article/update', function (request, response, next) {
    if (!request.session.verified) {
        response.sendStatus(403);
        response.end();
        return;
    }
    if (parseInt(request.body.id) === -1) {
        // new article
        let query = connection.query('INSERT INTO article SET ?', {
                title: request.body.title,
                description: request.body.description,
                datetime: request.body.datetime,
                tag: request.body.tag,
                content: request.body.content
            },
            function (error, results, fields) {
                if (error) {
                    response.sendStatus(500);
                    response.end();
                    return;
                }
                response.sendStatus(204);
            });
    } else {
        // update article
        let query = connection.query('UPDATE article SET ? WHERE id = ?', [{
                title: request.body.title,
                description: request.body.description,
                datetime: request.body.datetime,
                tag: request.body.tag,
                content: request.body.content
            }, request.body.id],
            function (error, results, fields) {
                if (error) {
                    response.sendStatus(500);
                    response.end();
                    return;
                }
                response.sendStatus(204);
            });
    }

});

module.exports = router;