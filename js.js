let fs         = require('fs'),
    {execFile} = require('child_process'),
    attrs      = new Set(/**you may leave an array classes or ids used in scripts here - [<class>, <id>]*/),
    index      = 0,
    trimCSS    = require('./trim-css'),
    fxn        = (nxt, files, outDir)=>fs.readFile(files.html[nxt], function(err, buf, buffer) {
      (buffer = buf.toString())
      .replace(/(id|class)="[^"]+"/g, e=>{
        (e.replace(/(id|class)=|"/g, '').split(' ')).forEach((m, el)=>{
          /** escape unusual strings or starting numbers in css selectors */
          m=m.replace('&amp;', '&').replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e);
            m.trim()&&attrs.add(m)
        })//, trimCSS(attrs, files.css, outDir)
      }),
      /** using setImmediate to call the function in itself to avoid
     * the maximum call stack size exceeded error which may occur for directories
     * containing a lot of the wanted HTML or CSS files
     */
      index<files.html.length?setImmediate(_=>fxn(index++, files, outDir)):console.log('::SELECTORS::', attrs.size)
  });

  
module.exports = init;

function init(obj, index, bool, props, values, files, rgxes, exists) {
  props=['html', 'css', 'out'], values=['./', 'css', 'dist'], files={}, rgxes=[], exists=[], 
  /* for when obj is null */ obj||={}, 
  /* heads up, typeof null equals 'object' hence why the above logical assignment is there*/
  typeof obj!=='object'&&(obj={}), index=0,
  bool = props.map((prop, i)=>(Array.isArray(prop=obj[prop])&&exists.push(prop.filter(e=>fs.existsSync(e)).length), obj[prop]||=values[i], prop&&fs.existsSync(prop.toString())&&prop.length&&(values[i]=prop))).filter(e=>e).length,

  values.slice(0, 2).forEach((value, i)=>{files[value=props[i]] = [], rgxes.push(new RegExp(`\.${value}$`))});
  if(!bool) console.error(`All or some of the required options are not provided to the \`remcss\` module, using ${JSON.stringify(obj)} as a fallback`);

  /** the promise below is used to have a callback for continuation whether the shell - 'ls <directory> -a' is spawned or not */
  let getFiles =value=>new Promise(resolve=>Array.isArray(value=values[index])
    /** the chained logic below is to consider non-existent files in provided arrays */
    &&exists[index]
    ? resolve(value)
    /** the option to read via ls faces ENOENT issues when ran in a Windows terminal */
    /** exists.length avoids warnings that haven't been asked for */
    : (exists.length&&!exists[index]&&console.warn('ENOENT:: For', value,' - reading', props[index].toUpperCase(), 'files from directory;', `${value=index?props[index]:'./'}`,  ' as a fallback'), execFile('ls', [value], (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
       resolve(stdout.split('\n').filter(e=>rgxes[index].test(e)))
   }))).then(provided=>{
    files[props[index]] = provided, index++,
     /** +1 below makes it stop at the element just before the last in the values array of which its last element is the output directory */
     index+1<values.length?getFiles(index):/*Done, continue*/fxn(0, files, values.pop())
   });

  getFiles(index);
}

init({html:'no.html'})