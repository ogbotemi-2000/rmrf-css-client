let fs         = require('fs'),
    path       = require('path'),
    {execFile, exec} = require('child_process'),
    /** a temporary autogenerated file for storing values required by the trimCSS function when the alternative of invoking
     * it directly via `node trim-css` is required */
    meta       = 'meta.txt',
    /** uuid for spliting the content of meta when deserializing the stored data in asScript */
    uid        = '^_^$rmrf-css$^_^';

function asScript() {

  console.warn('\nCalled asScript\n')
  /* Will be used as an alternative when the code is right
   */
  fs.readFile(meta, (err, buffer)=>{  
    buffer = (buffer=buffer.toString()).split(uid)
    
    trimCSS(new Set(buffer.shift().split(',').filter(e=>e)), buffer.shift().split(','), buffer.shift(), +buffer.shift())
  })
}

module.exports = trimCSS, require.main===module&&asScript();

function trimCSS(attrs, files, outDir, i, end, rerun, matches=new Set, comments=[], css='', ruleEnd, used='', generic='', warned, rkeys, file, vw_breaks, styles, fn, endDump={}, dump={}) {

/*the operation just below is particularly revolutionary in its consequence on the performance of this code and thus deserves this long comment.
This code had formerly provided an alternative of invoking asScript() where required, to what seemed like a performance slowdown of over 5 seconds for large CSS files of over 1-2MB.
The so-called alternative ended the code and prompted the user to directly invoke this script as `node path/to/script` in a [now wrong] guess that Node.js offered more 
runtime memory to directly invoked scripts than it does modules...

It is clear now that empty strings in the Set of detected selectors - attrs added greatly to the time complexity of this code and made it slow, hence why they are removed via .filter() below
The 'alternative' will be left where it is for reference purposes - the condition for its usage is never expected to be true because it ends up doing the same thing.

Should it ever be promted for by this code then please provide details such as the number of classes (the programs tells you) you are trimming against as a discussion
at https://github.com/ogbotemi-2000/rmrf-css/discussions/, it is not an issue.


^_^

*/
     attrs = new Set([...attrs].filter(e=>e)),

     i||=0 /*only make i zero if it is a falsy, this is usually for when asScript above calls this script*/
    /** vw_breaks may be provided by the user when the normal media query matching preset below fails to put utility media query selectors in their media query breakpoints */
    rkeys = new RegExp('('+Object.keys(vw_breaks = {base:500,sm:640,md:768,lg:1024,xl:1280, '32xl':1536}).join('|')+')\\\\:'),

    !fs.existsSync(outDir)&&fs.mkdirSync(outDir),
    end=_=>{
      matches.forEach(match=>{
        attrs.delete(match)
      });
      // fs.writeFileSync(path.join(outDir, 'matched.txt'), [...matches].join('\n')),
      // fs.writeFileSync(path.join(outDir, 'unmatched.txt'), [...attrs].join('\n'));

      for(let i in dump) {
        let value;
        if((value=dump[i]).replace(/@[^{]+\{/, '')) used+=value+(endDump[i]||'')
      }

      file = file.split(/(\/|\\)+/).pop(),
      fs.writeFileSync(path.join(outDir, file), `${used}\n\n/*${':'.repeat(20)} GENERIC STYLES IN TRIMMED STYLESHEET ${':'.repeat(20)}*/\n${generic}\n
/*${':'.repeat(20)} END OF GENERIC STYLES ${':'.repeat(20)}*/`),

      // fs.writeFileSync(path.join(outDir,'/_'+file), css),
      console.log('::DONE WRITING::', path.join(outDir, file)),

      /** clear dumps of media queries, may put this behind a flag as a feature for grouping media queries across files */
      dump = {}, endDump = {}
    },

    fn=()=>{
	warned = false;
      /** added a newline to the end of the stylesheet to accommodate adding closing braces for @-rules whose closing braces ends the string of styles */
      generic='', used='', css='', 
      
      styles = fs.readFileSync(file=files[i++]).toString()+'\n';
      console.log('::TRIMMING::', file, 'against', attrs.size, 'detected unique selectors');

      let _canAdd=!0, canAdd=!0, at_rule, media_rule, index=0, keepIndex=0, len=styles.length; each = styles.charAt(index); index<len,
      /** the callback: _cb is used by back and forward to loop over the stylesheet at the current index until
      * its start or until either an opening or closing curly brace is encountered
      */
      _cb=(s,f,bool)=>(!s.charAt(f)||(bool?/\}/:/\}|\{/).test(s.charAt(bool?f-1:f))),
      _back=num=>loop(styles, {from:num||index, back:true, cb:(s,f)=>_cb(s,f)})[0],
      _forward=(attr, num)=>loop(styles, {from:(num||index)+attr.length+1, cb:(s,f)=>_cb(s,f, !0)});

      rerun=(each, _log=20000)=>{
        slowT = new Date;
      /** the for loop below is used to boost the speed of the trimming algorithm.
       * It is in bytes per run and defaults to 1. It may be left as is below as a default or exposed as `--boost <N>`
       */
        for(let t, jump=0, boost=5000000; jump<boost&&(each = styles.charAt(index)); jump++) {
	  // Psst: the condition below is not normally expected to be true... 
          /* After over 5s slowdown of runtime when boosting, end the loop and advise the user to manually run the algorithm to implement a workaround*/
          if(!warned&&(t=new Date-slowT)>5765) {
	    warned = !0;
            let metadata = `${[...attrs].join(',')}${uid}${files}${uid}${outDir}${uid}${i-1}`;

            fs.writeFile(meta, metadata, err=>{
	      if(err) throw err;

              console.warn('-'.repeat(30)+`\n::[SLOWDOWN]:: Algorithm taking over <5 seconds> between boosts.\nPlease run "node ${path.join(__dirname, 'trim-css')}" directly as a workaround to a detected performance slowdown that has been observed to occur when 'require'd scripts - modules, run timely code in Node.js.
Not to worry the arguments you provided before are temporary persisted on the disk and will be used.\n`+'-'.repeat(30))
	    })
	     //, jump=boost, index=len, i = files.length;
            // return;
          
          }

          /**change _log above to any number to limit console logging to its multiples  */
          // index&&index/_log === Math.round(index/_log)&&console.log('::MATCHING.INDEX::', index, jump, t, 'milliseconds')

          /** overlook comments for now even ones that have CSS rules being matched in the code */
          _canAdd = notComment(styles, index);

          keepIndex = index;

          if(_canAdd&&each==='@'&&!at_rule) {
            let temp='', res='', add=0, kFrame, added='';

            temp=loop(styles, {from:index, cb:(s,f,t,r)=>{
              /**check whether the string is a media query up until the first encountered opening curly brace */
              if(/@media[^{]+\{/.test(res+=s[add=f])) {media_rule=res.replace(/\{/, ''), (res=res.match(/[0-9]+/g))&&(at_rule=res.join('_')); return true;}

              /** it is very important that kFrame, when true, remains true by virtue of ||=, this is to make the control statement below always true when 'keyframe'
               *  is encountered once, this loop then continues looping over the keyframe styles until its end as checked by atRuleEnd
               */
              else if(kFrame||=res.match('keyframes')) {
                /** atRuleEnd in the if-statement below uses the loop utility to loop over the keyframe rule till its end i.e when it encounters
                 * another closing curly brace after this truthy - s[f]==='}'
                 */
                if(s[f]==='}'&&(ruleEnd=atRuleEnd(styles, f))[0]) { add=ruleEnd[1], canAdd=(s[ruleEnd[1]]!=='}'), added=ruleEnd[2]; return ruleEnd[0]; }
              }
              /** The control statement below is to make this loop return strings added from
               *  @-rules that are on one line or are one style block deep like @charsest,  @import, @font-face up until where a semicolon ends in them.
               */
              else if(s[f]===';') {add=f; return true}

            }}),
            /**proceed to store the @-rules mentioned in the previous comment, which are gotten from the last else if statement above,
             * till their closing curly brace if they have one
             * temp[0].match('@font-face') below maybe replaced with /@(font-face|property)/.test(temp[0]) to match other one block level @-rules
            */
            res=temp[0].match('@font-face')?temp[0]+loop(styles, {from:temp[1]+1, cb:(s,f,t,r)=>(add=f, s[f-1]==='}')})[0]:temp[0];

            /** loop backwards from the index before the current one to get all prefixes to an @-rule until a whitespace*/
            if(res.charAt(0)) kFrame=loop(styles, {from:index-1, back:!0, cb:(s,f,t,r)=>!s[f-1]||!s[f].match(/\s/)})[0], res='\n'.repeat(!kFrame.match('\n'))+kFrame+res
            , !res.match('@media')
            /** add the terminating semi-colon to one-liner @-rules like import.
             * "dump" uniquely stores media at rules based on their breakpoints, these are all added together to the end of the algorithm
            */
              ? /* add matched @import rules to the start of the used stylesheet */(used+=res+added+added+(res.match('@import')?(canAdd=0, ';'):''), index=add)
              : /* at_rule stores the current media query rule which is dumped for now  */(dump[at_rule]||=res+'{', index=add, keepIndex=index+1/**point to the character after the open brace in media queries */, css+=res);
          }

          //update 'each' for when index gets increased to 'jump' over the @-rules matched above
          canAdd&&(css+=each=styles.charAt(index)), canAdd=!0;
          
          /** Added the code below to consider generic style blocks
           */
          if(styles.charAt(keepIndex)==='{') {
            /* only add styles that do not contain selector delimeters - ., # to the generic styles
            */
            let res, back = _back(keepIndex-1), forward = (res = _forward('', keepIndex-1))[0], rule=[media_rule+'{', media_rule?'}':''];

            !/\.|#/.test(back)&&(/*index=res[1],*/ generic +=(media_rule?rule[0]:'')+back+forward+rule[1])
          }

          /** The first regex considers only class or id selectors. The second regex test is to prevent matches like .5px in 0.5px.
           *  No worries, selectors that start with a number have to be escaped to be valid i.e .\32xl
           */
          if(/\.|#/g.test(each)&&!/[0-9]/.test(styles.charAt(index+1))) attrs.forEach((attr, to='')=>{
            to=loop(styles, {from:index+1, to:attr.length});

            /** Logical statement:
             * 1st part: check for equal CSS selectors in stylesheet. This is safer than using a regex as it considers escaped strings
             * 
             * 2nd part: checks whether the selector in question is standalone; it does not exist as a string in another selector
            */
            if(attr===to[0]&&!/[\\0-9A-Za-z_-]/.test(styles.charAt(to[1]+1))) {
              matches.add(attr);
              /** the use of .repeat below is for formatting purposes only */
              let back=_back(), forward=_forward(attr), res='\n'.repeat(!back.match('\n'))+back+attr+forward[0], rclass=res.match(rkeys), brkpt;

              /** add to the dump for media  @-rules if the current matched selector is in one, this is usually a media rule */
              at_rule?dump[at_rule]&&(dump[at_rule]+=res):(

              /** the logical statement and the if clause below is to consider utility classes for media query breakpoints and dump them together in the dump object */
              rclass&&(dump[brkpt=vw_breaks[rclass=rclass[0].replace('\\:', '')]])
              ? dump[brkpt]+=res
              : used+=res),

              /* jump ahead of the closing curly brace pointed to by forward[1] */
              index=forward[1],
              /** to remove repetitive selector delimeters - # or ., at the end of the strings */
              (back=back.trim()).length>1&&(css=css.replace(back, '')),
              css=css.replace(/(\s+|)(#|\.)$/g, '')
            }
          });
          /** for every closing curly brace, check if it is the end of a nested @-rule and dump the strings that end it in endDump only to
           * build them by adding the contents of dump and endDump together by calling end() at the end of the loop
	   * consider empty media queries by testing for an opening curly brace if a closing one fails
           */
          if(at_rule&&/\}|\{/.test(styles.charAt(index))) (ruleEnd=atRuleEnd(styles, index))[0]&&(endDump[at_rule]=ruleEnd[2], media_rule=at_rule=0);

          /** increment index at the end of it all, this is particularly important because the algorithm above requires that
           * styles.indexOf(styles.charAt(index)) equals index. Moving it to the start of the loop may cause bugs
           */
          index++;
        }
      if(index>len-1) console.timeEnd('::TRIMMED:: '+file+' in:'), end(), /* called fn again to concurrently trim each .css file */ i<files.length?fn():console.log(`\n::TRIMMED:: ${i} CSS files(s)\n`);

      /** call this entire code again using a Nodejs lifecycle method among which setImmediate performed fastest in benchmarks and thus is used */
      else setImmediate(_=>rerun())
    },
    /** called once to run */
    console.time('::TRIMMED:: '+file+' in:'), rerun()
    },
    // init
    fn()
  }

/*sends a flag to know whether the current index of styles is in a comment or not */
const notComment=(styles, index)=>{
  notComment._canAdd===void 0 &&(notComment._canAdd=true);
  switch(loop(styles, {from:index, to:2})[0]) {
    case '/*': notComment._canAdd=0; break;
    case '*/': notComment._canAdd=!0; break;
  }
  return notComment._canAdd
}, 
  /** looks ahead about twice or thrice to know when a closing curly brace has another after it.
   * The condition for the loop terminates when a non-whitespace character like '}' is encountered after the first closing brace
   */
atRuleEnd=(styles, index, exit_rule, res='', arr)=>(arr = loop(styles, { from:index, cb:(s,f, t, bool)=>(bool=!(t=s[++index]||s[--index]).match(/\s/), res+=s[f], exit_rule=t==='}', bool)}), [exit_rule, index, res]);

/** The most important function in this codebase.
 * Used to use a for loop imperatively to loop over strings either forwards or backwards
 * 
 * @param {*} str  The string, array (refactor .charAt to []) or an object based on index-based lookup via the square bracked notation
 * @param {*} props an object with this schema {from:number, to:number, cb: function, back}
 * @param {*} from overloaading argument to store the starting index for the looping
 * @param {*} to    `             `       `  `     `  index to loop, it is added with 'from' automatically
 * @param {*} cb    `             `       `  `     `  callback that returns true to terminate the loop, this termination is disregarded if to is provided and this callback is then called only once thereof,
 * cb is passed these arguments: str, from, to, result; the returned array to where loop is invoked,
 * back makes the loop work backwards until terminated by 'to', (has=str.charAt(from))===undefined or the returned value of cb
 * 
 * @returns an array as follows [added strings, incremented index]
 */
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