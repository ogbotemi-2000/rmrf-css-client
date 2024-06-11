let conn = ['', 's'].map(e=>require('http'+e)),
  both = require('./both'),
  splits=['_::split::_', '_08c-2a3_'];

module.exports = function(url, source, __retrieve__, response, kept, assets={css:[], js:[]}) {

  /*fs.writeFileSync('logs.txt', assets?JSON.stringify(assets):assets+''),
 for observing the bug in pm2 when passed the --watch flag on throttled connections
   */
  if((kept=__retrieve__[source])&&url==='__retrieve__') {
    let {inlined, matches_arr} = kept;
    /* split responses on the client using hopefully unique strings below */
    response.end(matches_arr.toString()+splits[0]+inlined.join(splits[1])),
    /* remove stored data*/
    delete __retrieve__[source]; 
  }

  else new Promise(resolve=>resolve(new URL(url))).then(_=>conn[+!!url.match(/https/)].get(source||url, res=>{
    let data=[], st=''+res.statusCode;
    res.on('data', chunk=>{
      data.push(chunk)
    }),
    res.on('end', (buffer, headers, inlined=[], html)=>{
      headers = formatJSON(JSON.stringify(res.headers)), html=getAssets((buffer=Buffer.concat(data)).toString(), headers, assets, inlined),
      __retrieve__[url] = {inlined},
      process.nextTick(_=>(__retrieve__[url]||={}).matches_arr = both.getAttrs(buffer.toString())),
      fs.writeFileSync('headers.txt', st+'\n'+JSON.stringify(headers)),

      !(st==304||/^(1|2)/g.test(st.charAt(0)))&&
      (assets.error='::[HTTP ERROR CODE]:: The HTTP code `'+st+'` is usually sent returned for requests that get undesired, non-HyperText responses.\n\n[HEADER]:\t'+headers),
      
      /*send unique strings for splitting responses and get them by splitting by the pipe character*/
      response.end(splits+'|'+JSON.stringify(assets)+splits[0]+html)
    })
  }).on('error', err => {
    assets.error='::[ERROR]:: '+err.message+'\n'+JSON.stringify(err),
    response.end(JSON.stringify(assets))
  }))
  .catch((err, message='')=>{
    response.end(JSON.stringify({
/*added ternary operation to cater for the ephemeral behaviour arising from setting hostname on this server's port*/
      error:"The provided URL is invalid, that's all we know\n"+formatJSON(JSON.stringify(err))
    }))
  })
}

let fs=require('fs');

function getAssets(buf, headers, assets, inlined=[], html='', hasTextMime='', loop) {
  /* a clean slate to avoid adding existing matches to new ones */
  html='', loop=both.loop, buf=buf.trim();
  for(let i=0; i<20; hasTextMime+=buf.charAt(i++));
  //fs.writeFile('./dump.html', buf, _=>console.log('::DUMPED::'));

  if(hasTextMime.match(/<\!DOCTYPE\s*HTML/ig)) {
    for(let title, attrs, strip=str=>str.replace(/^\.*\//, ''), unused =['content', 'target', 'path', 'style', 'name', 'for', 'href', 'charset'], tags=['style', 'script', 'link'], cTags=['lin', 'sty', 'scr'], if_tag, canAdd, check, checkElse, i=0, j, ast, ext, tEnd=i=>loop(buf, {from:i, cb:(s,f)=>s[f-1]==='>'}), len=buf.length, tag, sort=['js', 'css'], each;
    checkElse=if_tag=>(if_tag=if_tag[0]).charAt(0)==='/'&&cTags.find(e=>if_tag.slice(1)===e)&&(j=tEnd(i)[1]||0, canAdd=false), check=i=>tags.find(e=>(if_tag=loop(buf, {from:i+1, to:e.length}))[0]===e),
    j=ast=0, i<len;) {
      
      each = buf.charAt(i);
      if(each==='<') {
        if(tag=check(i)) buf.charAt(i+=tag.length+1)==='>' 
          /** increment i to make it point to the character after '<' */
          ? (inlined.push(canAdd = tag, ''), ++i)
          : (attrs=(ext=loop(buf, {from:i, cb:(s,f)=>s[f]==='>'}))[0].replace(/(src|href)=('|")[^("|')]+('|")/, e=>{
              e=e.split('='), ast=!0,
              /shortcut icon/i.test(ext[0])&&(assets.icon=strip(e[1].replace(/'|"/g, ''))),
              e[1].match(/\.(js|css)('|")/)&&assets[sort[+(e[0]==='href')]].push(strip(e[1].replace(/'|"/g, '')));
              return '';
            }),
            /**add values to i's value to make it point to the character after '<' in this loop */
            (canAdd=!ast)&&inlined.push(tag+ext[0], ''), i=ext[1]+1+!ast,
            /**to make the loop jump over closing tags for externally linked assets */
            buf[i+ast+1]==='/'&&(j=tEnd(ast+i+1)[1]||0)
          );
        else if(canAdd) checkElse(if_tag);
        /**testing with "titl" because the shortest tag to match - 'link'.length === 4
        */
        else !assets.title&&/titl/.test(if_tag[0])&&(title=loop(buf, {from:tEnd(if_tag[1])[1]+1, cb:(s,f)=>s[f]+s[f+1]==='</'}))[1]>i&&(i=title[1], assets.title=title[0]);
      }
      /**jump over known attributes that will never equal used selectors in an html file */
      unused.forEach(attr=>{

      }),
      /** the similar check below is needed to detect empty tags, both check and checkElse were created from the formerly rigid
       * if-else statements logical chain to bring dynamism into the code
       */
      (each=buf.charAt(i))==='<'&&(check(i), canAdd&&checkElse(if_tag)),
      j&&(i=j),
      /** will refactor code to remove '>' of the removed tags in html*/
      canAdd?inlined[inlined.length-1]+=each||'':html+=buf.charAt(i).replace('>', e=>j?'':e),
      i++
    }
  } else assets.error='::[ERROR]:: The provided URL does not point to an HTML resource\n\nHEADERS:' + headers;
  /**remove matching artefact '>>' and all content within tags that is from HyperText */
  html=html.replace(/>>+/g, '').replace(/>[^<]+</g, m=>'><'), 
  fs.writeFileSync('dump.txt', inlined.filter((e, i)=>(i%2)).join('\n_____\n'))

  return html;
}

function formatJSON(str) {
  return str.replace(/\{/g, e=>e+'\n`')
  .replace(/,/g, e=>e+`\n`)
  .replace(/\}/g, e=>'\n'+e)
}
