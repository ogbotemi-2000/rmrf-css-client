let conn              = ['', 's'].map(e=>require('http'+e)),
    both              = require('../both'),
    splits            = ['_::split::_', '_08c-2a3_', '__0x+|+x0__'],
    { store, format } = require('../utils'),
    __retrieve__      = store,
    formatJSON        = format;

module.exports = async function(request, response, invoked, kept, assets={css:[], js:[]}) {

  let { url, source } = request.query, result;
  if(source&&(kept = await __retrieve__.read(source))&&url==='__retrieve__') {

    let {0:inlined, 1:matches_arr} = kept.split(splits[2]), sent;
    /* split sent responses on the client-side using hopefully unique strings below */
    /* remove stored data*/
    __retrieve__.rm(source),
    sent = matches_arr.toString()+splits[0]+inlined;
    return invoked ? sent : response.end(sent);
  }
  else return new Promise(resolve=>resolve(new URL(url))).then(_=>fetch(source||url).then(res=>(result=res).text()).then(res=>{
    let sent, st=''+result.status, inlined=[], headers = formatJSON(JSON.stringify(result.headers)), html=getAssets(res, headers, assets, inlined);
    
    !(st==304||/^(1|2)/g.test(st.charAt(0)))&&
    (assets.error='::[HTTP ERROR CODE]:: The HTTP code `'+st+'` is usually sent returned for requests that get undesired, non-HyperText responses.\n\n[HEADER]:\t'+headers);
      
    /**  inlined +<string to split with>+matches_arr */
    /* replaced html returned by getAssets with res for now because it is mangled and buggy */
    let { 0: tr_html, 1: selectors } = both.getAttrs(res/**html */, 0, 0, !0);
    return new Promise(_res=>__retrieve__.write(inlined.join(splits[1])+splits[2]+selectors, function(uuid) {
      /*send only unique strings for splitting responses and get them by splitting by the pipe character*/
      sent = '|'+uuid+'|'+splits.filter((e, i)=>i^2)+'|'+JSON.stringify(assets)+splits[0]+tr_html,
      invoked ? _res(sent) : response.end(sent);
    }))
  }).catch(err => {
    assets.error='::[ERROR]:: '+err.message+'\n'+JSON.stringify(err),
    err = JSON.stringify(assets);
    return invoked ? err : response.end(err)
  }))
  .catch((err, msg)=>{
    msg = JSON.stringify({
      error:"The provided URL is invalid, that's all we know\n"+formatJSON(JSON.stringify(err))
    });
    return invoked ? msg : response.end(msg)
  })
}

function getAssets(buf, headers, assets, inlined=[], html='', hasTextMime='', loop) {
  /* a clean slate to avoid adding existing matches to new ones */
  html='', loop=both.loop, buf=buf.trim();
  for(let i=0; i<20; hasTextMime+=buf.charAt(i++));

  if(hasTextMime.match(/<\!DOCTYPE\s*HTML/ig)) {
    for(let title, attrs, strip=str=>str.replace(/^\.*\//, ''), tags=['style', 'script', 'link'], cTags=['lin', 'sty', 'scr'], if_tag, canAdd, check, checkElse, i=0, j, ast, ext, tEnd=i=>loop(buf, {from:i, cb:(s,f)=>s[f-1]==='>'}), len=buf.length, tag, sort=['js', 'css'], each;
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
  html=html.replace(/>>+/g, '').replace(/>[^<]+</g, m=>'><');

  return html;
}