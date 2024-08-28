let get     = require('./get'),
    crypto  = require('crypto'),
    {loop}  = require('../both'),
    splits,
    source
    styles  = {},
    format  = require('../utils').format,
    scripts = '',
    trim    = require('../trim-css'),
    result  = { };

module.exports = function(request, response) {
  let { url } = request.query;
  get(request, response, !0).then((data, rgxs)=>{
    if(/"error":/.test(data)) {/** avoided expensive JSON.parse(data) */
      response.end(data)
      return;
    }
    rgxs = [/^http(|s):\/+/, /^\|*[^|]+\|/],
    data = (data.replace(rgxs[1], e=>(source = e.replace(/\|/g, ''), ''))).replace(rgxs[1], e=>(splits = e.replace(/\|/g, '').split(','), ''));

    let { 0: meta, 1:html } = data.split(splits[0]),
        { origin }          = new URL(url), end, i=0;
    /** remove urls that do not resolve to `origin` as their domain */
    meta = JSON.parse(meta),
    ['css', 'js'].forEach((prop, _i, a)=>{
      meta[prop] = meta[prop].filter((link, i, a)=>rgxs[0].test(link) ? ~link.indexOf(origin) : !0), end = ++_i===a.length&&a.map(e=>meta[e].length).reduce((e, i)=>e+i,0),
      meta[prop].forEach(res=>fetch(res=(origin+'/').repeat(!rgxs[0].test(res))+res).then(res=>res.text()).then(str=>{
        prop==='css' ? styles[res] = str  : scripts+=str+'\n\n';
        if(++i==end) resume(request, response, html)
      }))
    })
  })
  
}

function resume(req, res, html, obj={}) {
  req.query = { source, url:'__retrieve__' },
  get(req, res, !0).then(sent=>{
    let { 0: classes, 1: inlined } = sent.split(splits[0]), inline='';
    (inlined = inlined.split(splits[1])).forEach((e, i, a, v)=>{
      v = a[++i];
      if(e==='script') scripts += v+'\n\n';
      else if(e==='style') inline += v+'\n\n';
    }),
    /** added html along with the scripts to obtain strings in inline event listeners */
    classes.split(',').forEach(e=>obj[e]=e),
    getStrings(scripts + html, obj), classes = Object.keys(obj),

    Object.keys(styles).forEach((key, i, a)=>{
      trim(classes, styles[key], function(trimmed) {
        // console.log('::CALLED BACK::', [key, i]),
        result[key] = trimmed,
        !a[++i]&&res.end(JSON.stringify(result))
      })
    })
  })
}

function getStrings(res, obj) {
  if(!res) return;
  /* backticks -> double quotes -> single quotes */
  for(let i=0, str, jump, nxt, cmt, len=res.length, tst=n=>/`|"|'/.test(res.charAt(n)), e; e=res.charAt(i), i<len;) {
    if(e==='/'&&/\/|\*/.test(nxt=res.charAt(i+1))) cmt=loop(res, {from:i, cb:(s,f,e)=>{
      return nxt==='/' ? s[f-1]==='\n': (s[f-2]+s[f-1]==='*/')
    }}), cmt[1]&&(i=cmt[1]); /* jump over comments */

    tst(i)&&(jump = loop(res, {from:i+1, cb:(s,f)=>tst(f)}), jump[1]>i&&(i=jump[1], 
    /*validate as selector*/ str = jump[0].trim(), str.length>1
    &&!+str.replace(/\./g, '')
    &&!/\/[a-z]|;|\\|^(_|--|:|\||=|\!|\+|\$|;|\/|#|\.|>|\&)|@|\+|\?|\{|\}|\%|<|(\||=|\!|\+|\/|-|:|\[|\]|\$|#|\.|>|\&|_)$|\(|\)/g.test(str)
    &&(str=str.replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e)).split(/\s+/).forEach(s=>(s=s.trim()).length>1&&!+s&&(obj[s] = s))
    ), i/*maybe increment i here*/), i++
  }
  return Object.keys(obj).toString().split(',').filter(e=>e)
}