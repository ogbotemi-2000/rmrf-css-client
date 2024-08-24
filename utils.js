function format(str) {
    return str.replace(/,/g, e=>e+'\n\t').replace(/\{|\}/g, e=>'\n'.repeat(e=='}')+e+'\n\t'.repeat(e=='{'))
}
/** start of functionality for storing data on Vercel serveless */
let fs     = require('fs'),
    uuid   = (a) => (a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)),
    rm     = id=>fs.unlinkSync(path.join(dir, id+'.txt')),
    dir    = `${/win/i.test(require('os').platform())?'.':''}/tmp/`,
    path   = require('path'),
    store  = {
			read: id =>new Promise((res, rej)=>fs.readFile(dir+id.replace(/\\|\/|"|\?|\:|\*|\<|\>|\|/g, '_')+'.txt', (err, buf)=>{
				if(err) rej(err);
				else res(buf.toString())
				})
			),
			write: function(data, cb, id) {
				/** removes wildcards to properly serialize URLS as file names */
				id &&=id.replace(/\\|\/|"|\?|\:|\*|\<|\>|\|/g, '_'),
				fs.writeFile(dir+(id||=uuid())+'.txt', data, _=>cb(id))
			},
			rm 
		};

/**  end */
module.exports = { format, store }