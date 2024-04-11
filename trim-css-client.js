let loop =  both.loop;
function trimCSS(styleSheets, attrs, progress, done, at, frameId, recon, end, callback, atRules=['import', 'keyframes', 'charset', 'font-face', 'property'], i=0, matches=new Set, comments=[], css='', ruleEnd, used='', rkeys, vw_breaks, styles, fn, endDump={}, dump={}) {
  /** vw_breaks will be provided by the user when normal media query matching code fails */
  recon=_=>{
    for(let i in dump) { let value; if((value=dump[i]).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i),*/ used+=value+(endDump[i]||'') }
  },
  rkeys = new RegExp('('+Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536}).join('|')+')\\\\:'),
  end=_=>{
    matches.forEach(match=>{
      attrs.delete(match)
    });
    for(let i in dump) {
      let value;
      if((value=dump[i]).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i),*/ used+=value+(endDump[i]||'')
    }
    console.log('::DONE WRITING::')
  },
  
  fn=()=>{
    used='', css='', styles = styleSheets[at],

    [attrs].forEach((attrs, attrs_index)=>{
      attrs = [...attrs],
      css='', /** clear the unused css to avoid redundancy */
      console.log('::DONE MATCHING.TRIMMING ATTRS::', attrs.length, attrs_index)
      
      let canAdd, at_rule, keepIndex=0, index=0, each, len=styles.length; canAdd=!0, each = styles.charAt(index), _used='', _css='';
      callback=(canAdd=!0, each)=>{
        progress([used, css], keepIndex>len?len:keepIndex, len, frameId);
        _used=_css='';
        for(let jump=0, boost=trimCSS.boost||1; jump<boost; jump++) { 
          each = styles.charAt(index)||(jump=boost, ''),
          index&&index/20000 === Math.round(index/20000)&&console.log('::MATCHING.INDEX::', index, loop(styles, {from:index, to:10})[0], styles.length);
          
          // if(each+styles.charAt(index+1)==='/*') canAdd=0, index = storeComments(index, styles, comments); //, console.log('::COMMENT::', loop(styles, {from:index, to:30}));
          
          if(each==='@'&&!attrs_index) {
            let temp='', res='', add=0, kFrame, added='';
            temp=loop(styles, {from:index, cb:(s,f,t,r)=>{
              if(/@media[^{]+\{/.test(res+=s[add=f])) {(res=res.match(/[0-9]+/g))&&(at_rule=res.join('_')); return true;}
              else if(kFrame||=res.match('keyframes')) {
                if(s[f]==='}'&&(ruleEnd=atRuleEnd(styles, f))[0]) { add=ruleEnd[1], canAdd=(s[ruleEnd[1]]!=='}'), added=ruleEnd[2]; return ruleEnd[0]; }
              }
              else if(s[f]===';') {add=f; return true}
            }}), res=/@(font-face|property)/.test(temp[0])?temp[0]+loop(styles, {from:temp[1]+1, cb:(s,f,t,r)=>(add=f, s[f-1]==='}')})[0]:temp[0];

            if(res.charAt(0)) kFrame=loop(styles, {from:index-1, back:!0, cb:(s,f,t,r)=>!s[f-1]||!s[f].match(/\s/)})[0], res='\n'.repeat(!kFrame.match('\n'))+kFrame+res, !res.match('@media')
              ? (used+=res+added+added+(res.match('@import')?(canAdd=0, ';'):''), index=add) : (dump[at_rule]||=res+'{', index=add, css+=res);
          }
          
          //update 'each' for changes made to 'index' above
          canAdd&&(css+=each=styles.charAt(index));
          /**making the set of classes in attrs in sizes of 200 makes the loop fast even for files as large
           * as the tailwind css framework
           */
          
          if(/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
            to=loop(styles, {from:index+1, to:attr.length});
            
            if(attr===to[0]&&!/[0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
              matches.add(attr); // matches_arr.push(attr)
                
              let _cb=(s,f,bool)=>(!s.charAt(f)||(bool?/\}/:/\}|\{/).test(s.charAt(bool?f-1:f))),
              back=loop(styles, {from:index, back:true, cb:(s,f)=>_cb(s,f)})[0],
              forward=loop(styles, {from:index+attr.length+1, cb:(s,f)=>_cb(s,f, !0)}),
              res='\n'.repeat(!back.match('\n'))+back+attr+forward[0], rclass=res.match(rkeys), brkpt;

              at_rule?dump[at_rule]&&(dump[at_rule]+=res):(
              rclass&&(dump[brkpt=vw_breaks[rclass=rclass[0].replace('\\:', '')]])
              ? dump[brkpt]+=res
              : used+=res),
              index=forward[1], (back=back.trim()).length>1&&(css=css.replace(back, '')),
              css=css.replace(/(\s+|)(#|\.)$/g, '')
            }
          });

          if(styles.charAt(index)==='}') at_rule&&(ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], at_rule=0);
          keepIndex = index++, trimCSS.reset=_=>{index=len, jump=boost};
        }
        if(index>len-1) cancelAnimationFrame(frameId), recon(), done(keepIndex, len, [used, css], frameId);/*end()*/
        else frameId=requestAnimationFrame(_=>callback())
      },
      callback()
      // )
    })
    // console.log('::COMMENTS::', comments);
    
    /** the code below add substantial milliseconds in the order of >3000ms to execution time, they will be placed behind a flag */
    // css=css.replace(/\s+/g, (e, rm)=>(rm=new Set(e.split('')), e='', rm.forEach(s=>e+=s), e)),
    // used=used.replace(/\s+/g, (e, rm)=>(rm=new Set(e.split('')), e='', rm.forEach(s=>e+=s), e)),

    //i<files.length&&fn()
  },
  fn()
}


const storeComments=(i, s, arr)=>(loop(s, {from:i, cb:(s,f,t,r)=>s.charAt(f++)+s.charAt(f)==='*/'&&(i=f, arr.push(r[0]+'*/'), !0) }), i),
atRuleEnd=(styles, index, exit_rule, res='')=>(loop(styles, { from:index, cb:(s,f, t, bool)=>(bool=!(t=s[++index]||s[--index]).match(/\s/), res+=s[f], exit_rule=t==='}', bool)}), [exit_rule, index, res]);