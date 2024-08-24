/** complete node server that is compatible with Vercel serverless functions */

let http   = require('http'),
    fs     = require('fs'),
    path   = require('path'),
    config = require('./config.json'),
    jobs   = {
      GET:function(req, res, parts, fxn) {
        /** middlewares that respond to GET requests are called here */
        fxn = fs.existsSync(fxn='.'+parts.url+'.js')&&require(fxn)
        if(parts.query) req.query = parts.params, fxn&&fxn(req, res);
        /** browsers use GET requests to request resources, the return statement below only delegates serving files to
         * server when req.url does not point to a middleware
         */
        return !!fxn;
      },
      POST:function(req, res, parts, fxn, bool) {
        fxn = fs.existsSync(fxn='.'+parts.url+'.js')&&require(fxn),
        req.on('data', function(data) {
          
          /**create req.body because the invoked module requires them to be defined */
          req.body = (parts = urlParts('?'+(data=data.toString()))).params,
          console.log('::DATA::', parts.params, parts.url),
          fxn&&fxn(req, res)
        });
        if(!fxn) res.end();
        return true;
      }
    },
    mime   = require('mime-types'),
    cache  = {}; /** to store the strings of data read from files */

http.createServer((req, res, url, parts, data, verb)=>{
  ({ url } = parts =  urlParts(req.url)),
  /** data expected to be sent to the client, this approach does away with res.write and res.send in the jobs */
  res.json=obj=>res.end(JSON.stringify(obj)), // for vercel functions
  data = jobs[verb=req.method](req, res, parts),

  url = url === '/' ? 'index.html' : url,
  /** the code below could be moved to a job but it is left here to prioritize it */
  new Promise((resolve, rej, cached)=>{
    /** the jobs above intrinsically return true to keep this promise in <pending> and thus
     * avoid reaching the static-file-serving aspect of this server below
    */
    if (data) { return; }

    /*(cached=cache[req.url])?resolve(cached):*/fs.readFile(path.join('./', url), (err, buf)=>{
      if(err) rej(err);
      else resolve(cache[req.url]=buf)
    })
  }).then(cached=>{
    res.writeHead(200, {
      /*'If-Modified-Since': 'Tue, 26 Mar 2024 16:01:34 GMT',
        'Last-Modified': 'Tue, 26 Mar 2024 16:01:34 GMT',
        'Cache-Control':'public; max-age=31536000',*/
      'Access-Control-Allow-Origin': '*',
      'Content-Type': mime.lookup(url) || 'application/octet-stream'
   /** return dynamic data or static file that was read */
   }),
   res.end(cached)
  }).catch(error=>{
    let { message } = error;
    console.log(message, [url]),
    res.writeHead(404, {
      'Content-Length': message.length
    }),
    res.end(message)
  })
/*hostname - 0.0.0.0 commented out for it causes ECONNREFUSED errors when trying this file in the service
 Setting hostname will only be done when deploying serivice to Railway
*/
}).listen(config.PORT, /* 0.0.0.0 */ _=>{
  console.log(`Server listening on PORT ${config.PORT}`)
})

function urlParts(url, params, query, is_html) {
    params = {}, query='',
    (url = decodeURIComponent(url)).replace(/\?[^]*/, e=>((query=e.replace('?', '')).split('&').forEach(e=>params[(e=e.split('='))[0]]=e[1]), '')),
    query &&= '?'+query,
    is_html = !/\.[^]+$/.test(is_html = (url = url.replace(query, '')).split('/').pop())||/\.html$/.test(is_html);
    return {
        params, query, url, is_html
    }
}