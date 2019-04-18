var express = require('express');
var router = express.Router();
var config = require('../config');
var mysql = require('mysql');
var connection = mysql.createConnection(config.database);
var md = require('markdown-it')();
var moment = require('moment');

router.get('/', function (request, response, next) {
    response.render('index', {title: 'Lyzde', css_url: '/css/index.css'})
});

router.get('/login', function (request, response, next) {
    response.render('login')
});

router.get('/admin', function (request, response, next) {
    response.render('admin')
});

router.get('/blog', function (request, response, next) {
    connection.query('SELECT id, title, description, datetime, tag FROM article ORDER BY id DESC',
        function (error, results, fields) {
            if (error) {
                response.render('error', {
                    title: 'Lyzde',
                    css_url: '/css/error.css',
                    message: 'Database Error',
                    error: error
                });
                response.end();
                return;
            }
            let post_list = [];
            for (let i = 0; i < results.length; i++) {
                post_list.push(results[i]);
                post_list[i].datetime = moment(post_list[i].datetime).fromNow() + " (" + moment(post_list[i].datetime).format("MMM Do YYYY") + ")";
                post_list[i].tag_list = post_list[i].tag.split('|');
            }
            response.render('blog', {title: 'Lyzde - Blog', css_url: '/css/blog.css', post_list: post_list});
        });
});

router.get('/post/:id', function (request, response, next) {
    let id = request.params.id;
    try {
        id = parseInt(id);
    } catch (error) {
        response.render('error', {
            title: 'Lyzde',
            css_url: '/css/error.css',
            message: 'Argument Error',
            error: error
        });
        response.end();
        return;
    }
    connection.query('SELECT * FROM article WHERE id = ?', [id],
        function (error, results, fields) {
            if (error) {
                response.render('error', {
                    title: 'Lyzde',
                    css_url: '/css/error.css',
                    message: 'Database Error',
                    error: error
                });
                response.end();
                return;
            }
            if (results.length !== 1) {
                response.render('error', {
                    title: 'Lyzde',
                    css_url: '/css/error.css',
                    message: 'Argument Error',
                    error: error
                });
                response.end();
                return;
            }
            let article = results[0];
            article.tag_list = article.tag.split('|');
            article.datetime = moment(article.datetime).fromNow() + " (" + moment(article.datetime).format("MMM Do YYYY") + ")";
            article.rendered_markdown = md.render(article.content);
            response.render('article', {
                title: 'Lyzde - ' + article.title,
                css_url: '/css/article.css',
                article: article
            });
        });
});

module.exports = router;
