(function() {

let loop =  both.loop;
function trimCSS(styleSheets, attrs, progress, done, at, threshold, frameId, recon, end, callback, atRules=['import', 'keyframes', 'charset', 'font-face', 'property'], i=0, matched=[], unmatched=[], css='', ruleEnd, used='', generic='', keys, rkeys, vw_breaks, styles, fn, endDump={}, dump={}) {
  /** vw_breaks will be provided by the user when normal media query matching code fails */
  recon=_=>{
    for(let i in dump) { let value; if((value=dump[i].trim()).replace(/@[^{]+\{/, '')) /*console.log('::VALUE::', i, [value]),*/ value+=(endDump[i]||''), used+=value, _used+=value }
    used +=`\n\n/*${':'.repeat(20)} GENERIC STYLES IN TRIMMED STYLESHEET ${':'.repeat(20)}*/\n${generic.trim()}\n
    /*${':'.repeat(20)} END OF GENERIC STYLES ${':'.repeat(20)}*/`.repeat(!!generic)
  },
  rkeys = new RegExp('('+(keys=Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536})).join('|')+')\\\\:'),
  /* set trimCSS.ease to true if undefined, it is used to ease the boosts for fresh matches*/
  trimCSS.ease === void 0&&(trimCSS.ease = true)
  fn=()=>{
    /** added a newline to the end of the stylesheet to accommodate adding closing braces for @-rules whose closing braces ends the string */
    used='', css='', styles = styleSheets[at]+'\n\n', threshold=trimCSS.threshold = 31000;//102468/*100.06 KB*/
    /** 200 below allow up to about 500 milliseconds before applying boost, this is enough time for the speed controls to show  */
    let ease=0, easeL=0/*200*/, _canAdd=!0, is_reset, canAdd, at_rule, media_rule, keepIndex=0, index=0, len=styles.length; canAdd=!0, _used='', _css='',
        _cb=(s,f,bool)=>(!s.charAt(f)||(bool?/\}/:/\}|\{/).test(s.charAt(bool?f-1:f))),

        _back=num=>loop(styles, {from:num||index, back:true, cb:(s,f)=>_cb(s,f)})[0],
        _forward=(attr, num)=>loop(styles, {from:(num||index)+attr.length+1, cb:(s,f)=>_cb(s,f, !0)});

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
      */
      ease<easeL&&ease++;
      for(let jump=0, boost=trimCSS.boost||1; jump<(trimCSS.ease?(boost=ease===easeL&&trimCSS.boost?trimCSS.boost:1):boost); jump++) {
        each = styles.charAt(index)||(jump=boost, ''),

        /** overlook comments for now even ones that have CSS rules being matched in the code */
        _canAdd = notComment(styles, index);
        keepIndex = index;
        /** avoid wrongly parsing stylesheet by avoiding '@' in at_rules that may have them like media queries  */
        if(_canAdd&&each==='@'&&!at_rule) {
          let temp='', res='', add=0, kFrame, added='';
          temp=loop(styles, {from:index, cb:(s,f,t,r)=>{
            if(/@media[^{]+\{/.test(res+=s[add=f])) {media_rule=res.replace(/\{/, ''), (res=res.match(/[0-9]+/g))&&(at_rule=res.join('_')); return true;}
            else if(kFrame||=res.match('keyframes')) {
              if(s[f]==='}'&&(ruleEnd=atRuleEnd(styles, f))[0]) { add=ruleEnd[1], canAdd=(s[ruleEnd[1]]!=='}'), added=ruleEnd[2]; return ruleEnd[0]; }
            }
            else if(s[f]===';') {add=f; return true}
          }}), res=/@(font-face|property)/.test(temp[0])?temp[0]+loop(styles, {from:temp[1]+1, cb:(s,f,t,r)=>(add=f, s[f-1]==='}')})[0]:temp[0];

          if(res.charAt(0)) kFrame=loop(styles, {from:index-1, back:!0, cb:(s,f,t,r)=>!s[f-1]||!s[f].match(/\s/)})[0], res='\n'.repeat(!kFrame.match('\n'))+kFrame+res, !res.match('@media')
            ? (used+=_used=res+added+added+(res.match(/@(import|charset)/)?(canAdd=0, ';'):''), index=add) : (dump[at_rule]||=res+'{', index=add, keepIndex=index+1, css+=_css=res);
        }
	      each = styles.charAt(index);
	      if(_canAdd) '';
        //update 'each' for changes made to 'index' above
        canAdd&&(css+=each=styles.charAt(index), _css+=each), canAdd=true;

        /** Added the code below to consider generic style blocks
           */

        if(styles.charAt(keepIndex)==='{') {
          /* only add styles that do not contain selector delimeters - ., # to the generic styles
          */
          let res, back = _back(keepIndex-1), forward = (res = _forward('', keepIndex-1))[0], rule=[media_rule+'{', media_rule?'}':''];

          !/\.|#/.test(back)&&(/*index=res[1],*/ generic +=(media_rule?rule[0]:'')+back+forward+rule[1])
        }

        if(/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
          to=loop(styles, {from:index+1, to:attr.length});

          if(attr===to[0]&&!/[\\0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
            !~matched.indexOf(attr)&&matched.push(attr);

            let back=_back(), forward=_forward(attr), res='\n'.repeat(!back.match('\n'))+back+attr+forward[0], rclass=res.match(rkeys), brkpt;

            at_rule?dump[at_rule]&&(dump[at_rule]+=res):(
            rclass&&(dump[brkpt=vw_breaks[rclass=rclass[0].replace('\\:', '')]])
            ? dump[brkpt]+=res
            : (used+=res, _used+=res)),
            index=forward[1], (back=back.trim()).length>1&&(css=css.replace(back, ''), _css=_css.replace(back, '')),
            css=css.replace(/(\s+|)(#|\.)$/g, ''), _css=_css.replace(/(\s+|)(#|\.)$/g, '')
          } else !~unmatched.indexOf(attr)&&unmatched.push(attr);
        });
        /** added condition to consider empty media queries by testing for an opening curly brace if a closing one fails  */
        if(/\}|\{/.test(styles.charAt(index))&&at_rule) (ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], media_rule=at_rule=0);
        index++, trimCSS.reset=_=>{is_reset=true, index=len, jump=boost};
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