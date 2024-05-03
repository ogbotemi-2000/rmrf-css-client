let http    = require('http'),
    path    = require('path'),
    fs      = require('fs'),
    values  = {'-d':'./', '-a':'../', '-p':5000},
    format  = e=>JSON.stringify(e).replace(/\{|\}|,/g, e=>e=='}'?'\n'+e:e+'\n\t'),
    mime    = require('mime-types'),
    cache   = {};

http.createServer((req, res, str, params={})=>{
    req.url = decodeURI(req.url),
    req.url = req.url.replace(/\?[^]*/, e=>(query=e.replace('?', '').split('&').forEach(e=>params[(e=e.split('='))[0]]=e[1]), '')),
    req.url=='/'&&(req.url='index.html'),

    req.url.match(/\.html$/)&&(str=[req, res].map(e=>format(e.headers||''))),
    req.url=path.join(values['-d'], req.url);

    // req.url.match(/tail|page|all/)&&(req.url=req.url.replace('css', 'trimmed')),
    console.log('::URL::', req.url),
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*'
    })
    
    new Promise((resolve, rej, cached)=>{
    /*(cached=cache[req.url])?resolve(cached):*/fs.readFile(req.url, (err, buf)=>{
        if(err) rej(err);
        else resolve(cache[req.url]=buf)
    })
    }).then(cached=>{
    res.writeHead(200, {
        /*'If-Modified-Since': 'Tue, 26 Mar 2024 16:01:34 GMT',
        'Last-Modified': 'Tue, 26 Mar 2024 16:01:34 GMT',
        'Cache-Control':'public; max-age=31536000',*/
        'content-type': mime.lookup(req.url) || 'application/octet-stream'
    }),
    res.end(cached)
    }).catch((err, str)=>{
        console.log(str='::ERROR:: '+err),
        res.end(str)
    })
}).listen(port=process.env.PORT||+values['-p'], '0.0.0.0', function() {
    console.log('Server listening on <PORT>', port, 'under <DIRECTORY>', values['-d'], 'and serving assets from <DIRECTORY>', values['-a']);
})