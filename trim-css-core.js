const fs = require('fs');

module.exports = function trimCSS(all_attrs, attrs, end, callback, matches_arr=[], i=0, matches=new Set, comments=[], css='', ruleEnd, used='', rkeys, files, file, vw_breaks, styles, fn, endDump={}, dump={}) {
    /** vw_breaks will be provided by the user when normal media query matching code fails */
    rkeys = new RegExp('('+Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536}).join('|')+')\\\\:'),
    files=['css/tailwind.min.css', 'css/all.min.css', 'css/page.css'], !fs.existsSync('trimmed')&&fs.mkdirSync('trimmed'),
    end=_=>{
      matches.forEach(match=>{
        attrs.delete(match)
      }), fs.writeFileSync('trimmed/matched.txt', [...matches].join('\n')),
      fs.writeFileSync('trimmed/unmatched.txt', [...attrs].join('\n'));
  
      for(let i in dump) {
        let value;
        if((value=dump[i]).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i),*/ used+=value+(endDump[i]||'')
      }

      file = file.split('/').pop(), fs.writeFileSync('trimmed/'+file, used), fs.writeFileSync('trimmed/_'+file, css),
      console.log('::DONE WRITING::')
    },
    
    fn=()=>{
      used='', css='', styles = fs.readFileSync(file=files[i++]).toString(),

    //   all_attrs
      [attrs].forEach((attrs, attrs_index)=>{
        attrs = [...attrs],
        css='', /** clear the unused css to avoid redundancy */
        console.log('::DONE MATCHING.TRIMMING ATTRS::', attrs.length, all_attrs.length, attrs_index)
        
        // for(
            let canAdd, at_rule, index=0, each, len=styles.length; canAdd=!0, each = styles.charAt(index); index<len;
            // );
        // setImmediate(
            callback=(canAdd=!0, each)=>{
          each = styles.charAt(index),
          index&&index/20000 === Math.round(index/20000)&&console.log('::MATCHING.INDEX::', index, loop(styles, {from:index, to:10})[0], styles.length);
          
          if(each+styles.charAt(index+1)==='/*') canAdd=0, index = storeComments(index, styles, comments); //, console.log('::COMMENT::', loop(styles, {from:index, to:30}));
          
          if(each==='@'&&!attrs_index) {
            let temp='', res='', add=0, kFrame, added='';
            temp=loop(styles, {from:index, cb:(s,f,t,r)=>{
              if(/@media[^{]+\{/.test(res+=s[add=f])) {(res=res.match(/[0-9]+/g))&&(at_rule=res.join('_')); return true;}
              else if(kFrame||=res.match('keyframes')) {
                if(s[f]==='}'&&(ruleEnd=atRuleEnd(styles, f))[0]) { add=ruleEnd[1], canAdd=(s[ruleEnd[1]]!=='}'), added=ruleEnd[2]; return ruleEnd[0]; }
              }
              else if(s[f]===';') {add=f; return true}
            }}), res=temp[0].match('@font-face')?temp[0]+loop(styles, {from:temp[1]+1, cb:(s,f,t,r)=>(add=f, s[f-1]==='}')})[0]:temp[0];
  
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
          index++;
          if(index>len-1) console.timeEnd('LOOP'), end(), console.log('::DONE::', index, attrs_index, all_attrs.length);
          else setImmediate(_=>callback())
        },
        console.time('LOOP'), callback()
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

function loop(str, props, from, to, cb) {
  len=str.length,
  from = Math.abs(props['from'])||0, to = Math.abs(props['to'])||0, cb = props['cb'];
  if(typeof cb !== 'function') cb =_=>!!0;
  let result = [''], has=!0, reach, down = props['back'];
  if(down) { if(from>len) from=len-1; to=from-to;}
  reach=from+to;

  for(; !cb(str, from, to, result)&&(to?from < reach:has);) {
    result[0] += (has=str.charAt(result[1] = down?from--:from++))||'';
    if(down&&to===from) break;
  }
  if(down) result[0] = result[0].split('').reverse().join(''), result[1] &&= ++result[1];
  return result
}
