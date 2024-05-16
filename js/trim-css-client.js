(function() {

let loop =  both.loop;
function trimCSS(styleSheets, attrs, progress, done, at, threshold, frameId, recon, end, callback, atRules=['import', 'keyframes', 'charset', 'font-face', 'property'], i=0, matched=[], unmatched=[], css='', ruleEnd, used='', keys, rkeys, vw_breaks, styles, fn, endDump={}, dump={}) {
  /** vw_breaks will be provided by the user when normal media query matching code fails */
  recon=_=>{
    for(let i in dump) { let value; if((value=dump[i]).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i),*/ value+=(endDump[i]||''), used+=value, _used+=value }
  },
  rkeys = new RegExp('('+(keys=Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536})).join('|')+')\\\\:'),
  
  fn=()=>{
    used='', css='', styles = styleSheets[at], threshold=trimCSS.threshold = 102468/*100.06 KB*/;
    
    let ease=0, easeL=200, _canAdd=!0, is_reset, canAdd, at_rule, keepIndex=0, index=0, len=styles.length; canAdd=!0, _used='', _css='';
    callback=(canAdd=!0, each)=>{
      progress(index>threshold?[_used, _css]:[used, css], used, keepIndex>len?len:keepIndex, len, index>threshold);
      /* clear the displayed styles when their size exceed a calculated limit at which the UI begins to hang from too much text on the DOM*/
      _used.length>=threshold&&(_used=''), _css.length>threshold&&(_css='');
      /** ease and easeL below are used to make the loop run at its default speed until
       * ease===easeL.
       * 
       * This is useful as a brilliant UX feature whereby there is a few seconds extra for a user to throttle the trimming speed 
       * when the options appear thereby making the user still in control especially for relatively small stylesheets that may seem to
       * be trimmed too fast.
       * Adjusting easeL above to lesser values reduces this extra time a user has to throttle the said speed.
       * ease<easeL&&ease++;
       */
      for(let jump=0, boost=trimCSS.boost||1; jump<boost/*(boost=ease===easeL&&trimCSS.boost?trimCSS.boost:1)*/; jump++) {
        each = styles.charAt(index)||(jump=boost, ''),

        /** overlook comments for now even ones that have CSS rules being matched in the code */
        _canAdd = notComment(styles, index);

        if(_canAdd&&each==='@') {
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
	      each = styles.charAt(index);
	      if(_canAdd) '';
        //update 'each' for changes made to 'index' above
        canAdd&&(css+=each=styles.charAt(index), _css+=each), canAdd=true;

        if(/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
          to=loop(styles, {from:index+1, to:attr.length});

          if(attr===to[0]&&!/[\\0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
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

	/* clear the throttled output strings at the end of a blocks of styles */
        if(styles.charAt(index)==='}') at_rule&&(ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], at_rule=0);
        keepIndex = index++, trimCSS.reset=_=>{is_reset=true, index=len, jump=boost};
      }
      if(index>=len-1) cancelAnimationFrame(frameId), recon(), done(keepIndex, len, [used, css], [matched, unmatched], index>threshold, is_reset), is_reset=false;
      else frameId=requestAnimationFrame(callback);
    },
    setTimeout(_=>callback())
  },
  fn()
}

const notComment=(styles, index)=>{
  notComment._canAdd===void 0 &&(notComment._canAdd=true);
  switch(loop(styles, {from:index, to:2})[0]) {
    case '/*': notComment._canAdd=0; break;
    case '*/': notComment._canAdd=!0; break;
  }
  return notComment._canAdd
},
atRuleEnd=(styles, index, exit_rule, res='')=>(loop(styles, { from:index, cb:(s,f, t, bool)=>(bool=!(t=s[++index]||s[--index]).match(/\s/), res+=s[f], exit_rule=t==='}', bool)}), [exit_rule, index, res]);

window.trimCSS = trimCSS
})()