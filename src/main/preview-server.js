
import http from 'http';
import url from 'url';

var server;
var content;

export function createServer() {
    if (server) throw new Error("Server already started");
    server = http.createServer(requestHandler);
    server.listen(0, "127.0.0.1");
}

export function newContent(text) {
    content = text;
    return genurl('content');
}

export function currentContent() {
    return content;
}

function genurl(pathname) {
    const url2preview = url.format({
        protocol: 'http',
        hostname: server.address().address,
        port: server.address().port,
        pathname: pathname
    });
    return url2preview;
}

function requestHandler(req, res) {
    try {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': content.length
        });
        res.end(content);
    } catch(err) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end(err.stack);
    }
}
