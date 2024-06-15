let http    = require('http'),
    values  = {'-d':'./', '-a':'../', '-p':process.env.PORT||80},
    cache   = {};

// http.get('http://localhost:8000/js/ripples.js', res=>{
//   let data=[];
//   res.on('data', buffer=>data.push(buffer))
//   res.on('end', _=>console.log(Buffer.concat(data).toString()))
// })

http.createServer((req, res, str, params={})=>{
  req.url = decodeURIComponent(req.url),
  req.url = req.url.replace(/\?[^]*/, e=>(query=e.replace('?', '').split('&').forEach(e=>params[(e=e.split('='))[0]]=e[1]), '')),

  console.log('::URL::', req.method, req.url, params),
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*'
    /** Remember to set the above header to the url of the static website for hosting this idea.
     * [An experiment]:: Doing the above will even block requests of this server to itself, perhaps
     * the pattern noticed below will not hold by then...
      */
  }),
  /**____________________________________________________________________________________________________________ 
   * a likely loop hole to trigger race conditions for web services having separate servers for content and tasks:
   * 
   * send a request with ?url='<this server endpoint URL>'
   * 
   * It works! At least this server is hit twice for a single request, it is safe in this case but it may be disastrous for a production server of popular SaaS brands
   * ____________________________________________________________________________________________________________________________________
   * passing the --watch flag to pm2 made the server sort of clear its scope and make all global variables undefined for a single response sent in <T>ms.
   * I guess this is pm2 authors' way of ensuring that --watch do not long-lived
   * global variables and thus produce side effects as handling global variables would prove difficult.
   * Also the global variables that were made undefined regain their original values when a closely following request is made immediately after the first one on
   * fast connections with no throttling - this means all the presets in the Network tab cause the said behaviour
   * 
   * A solution is to just prevent this behaviour if the file is not actively being modified
   */
  /** the only bit needed when this server acts as the endpoint for the SaaS, simply ends the requests that do not conform */
  params.url ? (require('./get')(params.url, params.source, res)) : res.end('<!DOCTYPE HTML><html><head><title>Unsupported communication schema - 0_0</title></head></html>')
})
/*added 0.0.0.0 as hostname below for successful deployments on railway*/
.listen(port=+values['-p'], '0.0.0.0', function() {
  console.log('Service listening on <PORT>', port);
})
