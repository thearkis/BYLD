/**
 * @lib ProjectServer Веб-сервер проектов
 * @ver 0.1.0
 * @arg --port {8070!} Порт
 */
var argv = require('minimist')(process.argv)
var http = require('http')
var httpRequest = require('request')
var url = require('url')
var qs = require('querystring')
var fs = require('fs')
var path = require('path')
var execSync = require('child_process').execSync
var conf = require('./conf')

// Set port explicitly to 8080
const PORT = 8080;

var staticPathRegExp = /\.(?:jpg|png|gif|svg|mp3|mp4|zip|html|css|js|bml|ttf|otf|woff|woff2)$/
var imageExt = ['jpg', 'png', 'gif', 'svg']

function responseFile(request, response, path) {
    var filePath = path.slice(1)
    var fileExt = path.split('.').pop()

    if (conf.httpHeader[fileExt] !== undefined) {
        for (var name in conf.httpHeader[fileExt]) {
            response.setHeader(name, conf.httpHeader[fileExt][name])
        }
    }

    if (fileExt === 'html') {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                response.writeHead(404, conf.httpHeader[404])
                response.end('404')
            } else {
                var string = data.toString()

                // Добавить статику для экспериментов
                if (request.query.exp) {
                    string = addStaticForExperiments(
                        string, request.query.exp.split(/;|,/)
                    )
                }

                response.end(string)
            }
        })
    } else {
        var readStream = fs.createReadStream(filePath)
        readStream.pipe(response)
        readStream.on('error', function() {
            response.writeHead(404, conf.httpHeader[404])
            response.end('404')
        })
    }
}

/**
 * Запуск сервера
 */
http.createServer(function (request, response) {
    var param = url.parse(request.url, true)
    var query = param.query
    var path = param.pathname
    var pathIsStatic = staticPathRegExp.test(path)

    request.query = query

    if (path !== '/' && path.slice(-1) === '/') {
        path = path.slice(0, -1)
    }

    if (path === '/' ) {
        responseFile(request, response, '/projects/site/pages/main.html')
    }
    // Статичный файл
    else if (pathIsStatic) {
        responseFile(request, response, path)
    }
    // 404
    else {
        response.writeHead(404, conf.httpHeader[404])
        response.end('404')
    }
})
.listen(PORT)

console.log(`Project server is running on http://localhost:${PORT}`)

function addStaticForExperiments (string, exp) {
    var indexOfBml = string.indexOf('<script type="bml">')
    if (indexOfBml !== -1) {
        var embedString = ''
        for (var i = 0, ii = exp.length; i < ii; i++) {
            embedString += `<script type="text/javascript" src="/build/exp/${exp[i]}.js"></script>`
            embedString += `<link type="text/css" rel="stylesheet" href="/build/exp/${exp[i]}.css">`
        }
        string = string.substring(0, indexOfBml) + embedString + string.substring(indexOfBml)
    }

    return string
}