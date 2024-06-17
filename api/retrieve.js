let fs     = require('fs'),
    uuid   = (a) => (a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)),
    rm     = id=>fs.unlinkSync(path.join(dir, id+'.txt')),
    dir    = '/tmp/',
    path   = require('path');

module.exports = {
  read: id =>new Promise((res, rej)=>fs.readFile(dir+id+'.txt', (err, buf)=>{
      if(err) rej(err);
      else res(buf.toString())
    })
  ),
  write: function(data, cb, id) {
    fs.writeFile(dir+(id=uuid())+'.txt', data, _=>cb(id))
  },
  rm 
}
