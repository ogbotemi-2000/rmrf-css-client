let {exec}   = require('child_process'),
    path     = require('path'),
    fs       = require('fs'),
    trimCSS  = require('./trim-css'),
    dirs     = ['css', 'public'],
    getFiles = (ext, dir)=>new Promise((resolve, reject)=>exec(`ls ${dir||'./'}`, (error, stdout, stderr, dir) => {
        if (error) reject(error), console.warn(/*throw */error) /* a warning instead of 'throw'ing this error */;

	/* split and filter strings that match this regex /\.css$/ or /\.html$/.
	 * The verbosity of using replace below is to properly retrieve the file names from the output of the program
	 */
	stdout.replace(new RegExp(`\\s[^]+\\.${ext}`, 'g'), str=>{
	  resolve([...str.split(/\s+/).filter(e=>e&&new RegExp(`\\.${ext}`).test(e))])
	})
    })),
    attrs=[];

getFiles('txt', dirs[1]).then(txts=>{
  txts.forEach(txt=>{
    txt = fs.readFileSync(path.join(dirs[1], txt)).toString().split(',').filter(e=>e.trim()),
    attrs = attrs.concat(txt)
  }),
  attrs = new Set(attrs),
  getFiles('css', dirs[0]).then(css=>{
    trimCSS(attrs, css.map(e=>path.join(dirs[0], e)), dirs[1]),

    /* change the path for css files to `public`*/
    // dirs.reverse()
    getFiles('html').then(files=>{
      files.forEach(file=>fs.writeFileSync(file, fs.readFileSync(file).toString().replace(new RegExp(`("|')\\.*\\/*${dirs[0]}\\/`, 'g'), dir=>dir.replace(dirs[0],  dirs[1]))))
    })
  })
})
