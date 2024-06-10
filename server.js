let http    = require('http'),
    path    = require('path'),
    fs      = require('fs'),
    values  = {'-d':'./', '-a':'../', '-p':5000},
    format  = e=>JSON.stringify(e).replace(/\{|\}|,/g, e=>e=='}'?'\n'+e:e+'\n\t'),
    mime    = require('mime-types'),
    get     = require('./get'),
    cache   = {};

http.createServer((req, res, str, params={}, getParams)=>{
    req.url = decodeURIComponent(req.url),
    getParams=url=>url.replace(/\?[^]*/, e=>(query=e.replace('?', '').split('&').forEach(e=>params[(e=e.split('='))[0]]=e[1]), '')),
    
    req.url = getParams(req.url),
    req.url=='/'&&(req.url='index.html'),

    req.url.match(/\.html$/)&&(str=[req, res].map(e=>format(e.headers||''))),
    req.url=path.join(values['-d'], req.url),

    req.on('data', function(data) {
      //console.log('::POST::', [data.toString()])
    }),
   
    //console.log('::URL::', req.url, params),
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*'
    }),

    params.url ? get(params.url, params.for, res)
    : new Promise((resolve, rej, cached)=>{
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
        //console.log(str='::ERROR:: '+err),
        res.end(str)
      })
//hostname - 0.0.0.0 commented out for it causes ECONNREFUSED errors when trying this file in the service
}).listen(port=process.env.PORT||+values['-p'], /*'0.0.0.0',*/ function() {
    console.log('Server listening on <PORT>', port, 'under <DIRECTORY>', values['-d'], 'and serving assets from <DIRECTORY>', values['-a']);
})
