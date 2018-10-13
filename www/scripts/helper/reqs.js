// Require dependencies of modules not directly referenced in js files which will then be specifically required in the
//	it's own js file.
// Ex. stylesheets, knockout custom-bindings (bindigns referenced in html)

//Load Global libraries
window.ko = require('knockout');
require('knockout-mapping');
window.Promise = require('bluebird');
window.$ = require('jquery');
window.moment = require('moment');
window.jsonpath = require('jsonpath');

// All styling
require('bootstrap/scss/bootstrap.scss');
var context = require.context("../../css", true, /^.*\.scss$/im);
context.keys().forEach(function (key) { context(key); });
context = require.context("../../external/dto/css", true, /^.*\.scss$/im);
context.keys().forEach(function (key) { context(key); });

//// Ambient libraries
require('bootstrap');
var contextJS = require.context("../custom-modules", true, /^.*\.js$/im);
contextJS.keys().forEach(function (key) {
    contextJS(key);
})

//// Binding templates
var contextHTML = require.context("../../html", true, /^.*\.html$/im);
var templates = [];
contextHTML.keys().forEach(function (key) { templates.push(contextHTML(key)); });

var contextHTML = require.context("../../external/dto/html", true, /^.*\.html$/im);
contextHTML.keys().forEach(function (key) { templates.push(contextHTML(key)); });

$('body').append(templates.join('\n'));

