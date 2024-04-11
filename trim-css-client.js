let loop =  both.loop;
function trimCSS(styleSheets, attrs, progress, done, at, threshold, frameId, recon, end, callback, atRules=['import', 'keyframes', 'charset', 'font-face', 'property'], i=0, matched=[], unmatched=[], css='', ruleEnd, used='', keys, rkeys, vw_breaks, styles, fn, endDump={}, dump={}) {
  /** vw_breaks will be provided by the user when normal media query matching code fails */
  recon=_=>{
    for(let i in dump) { let value; if((value=dump[i]).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i),*/ value+=(endDump[i]||''), used+=value, _used+=value }
  },
  rkeys = new RegExp('('+(keys=Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536})).join('|')+')\\\\:'),
  /* remove classes that equal delimiters used to target media query breakpoint classnames. Not doing so will make the algorithm
     match all rules that contain them */
  attrs = attrs.filter(e=>!keys.find(_e=>e.trim()===_e)),
  fn=()=>{
    used='', css='', styles = styleSheets[at],
    threshold=trimCSS.threshold = 102468/*100.06 KB*/,
    [attrs].forEach((attrs, attrs_index)=>{
      attrs = [...attrs],
      css='', /** clear the unused css to avoid redundancy */
      console.log('::DONE MATCHING.TRIMMING ATTRS::', attrs.length, attrs_index)
      
      let is_reset, canAdd, at_rule, keepIndex=0, index=0, each, len=styles.length; canAdd=!0, each = styles.charAt(index), _used='', _css='';
      callback=(canAdd=!0, each)=>{
        progress(index>threshold?[_used, _css]:[used, css], used, keepIndex>len?len:keepIndex, len, frameId);
        _used=_css='';
        for(let jump=0, boost=trimCSS.boost||1; jump<boost; jump++) {
          each = styles.charAt(index)||(jump=boost, '');
          //index&&index/20000 === Math.round(index/20000)&&console.log('::MATCHING.INDEX::', index, loop(styles, {from:index, to:10})[0], styles.length);
          
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
              ? (used+=_used=res+added+added+(res.match(/@(import|charset)/)?(canAdd=0, ';'):''), index=add) : (dump[at_rule]||=res+'{', index=add, css+=_css=res);
          }
          
          //update 'each' for changes made to 'index' above
          canAdd&&(css+=each=styles.charAt(index), _css+=each);
          /**making the set of classes in attrs in sizes of 200 makes the loop fast even for files as large
           * as the tailwind css framework
           */
          
          if(/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
            to=loop(styles, {from:index+1, to:attr.length});

            if(attr===to[0]&&!/[0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
              !~matched.indexOf(attr)&&matched.push(attr);

              let _cb=(s,f,bool)=>(!s.charAt(f)||(bool?/\}/:/\}|\{/).test(s.charAt(bool?f-1:f))),
              back=loop(styles, {from:index, back:true, cb:(s,f)=>_cb(s,f)})[0],
              forward=loop(styles, {from:index+attr.length+1, cb:(s,f)=>_cb(s,f, !0)}),
              res='\n'.repeat(!back.match('\n'))+back+attr+forward[0], rclass=res.match(rkeys), brkpt;

              at_rule?dump[at_rule]&&(dump[at_rule]+=res):(
              rclass&&(dump[brkpt=vw_breaks[rclass=rclass[0].replace('\\:', '')]])
              ? dump[brkpt]+=res
              : (used+=res, _used+=res)),
              index=forward[1], (back=back.trim()).length>1&&(css=css.replace(back, ''), _css=_css.replace(back, '')),
              css=css.replace(/(\s+|)(#|\.)$/g, ''), _css=_css.replace(/(\s+|)(#|\.)$/g, '')
            } else !~unmatched.indexOf(attr)&&unmatched.push(attr);
          });

          if(styles.charAt(index)==='}') at_rule&&(ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], at_rule=0);
          keepIndex = index++, trimCSS.reset=_=>{is_reset=true, index=len, jump=boost};
        }
        if(index>len-1) cancelAnimationFrame(frameId), recon(), done(keepIndex, len, [used, css], [matched, unmatched], index>threshold, is_reset);/*end()*/
        else frameId=requestAnimationFrame(_=>callback())
      },
      callback()
    })
  },
  fn()
}


const storeComments=(i, s, arr)=>(loop(s, {from:i, cb:(s,f,t,r)=>s.charAt(f++)+s.charAt(f)==='*/'&&(i=f, arr.push(r[0]+'*/'), !0) }), i),
atRuleEnd=(styles, index, exit_rule, res='')=>(loop(styles, { from:index, cb:(s,f, t, bool)=>(bool=!(t=s[++index]||s[--index]).match(/\s/), res+=s[f], exit_rule=t==='}', bool)}), [exit_rule, index, res]);
