const {execFile, spawn} = require('child_process');

module.exports = function(cmd, args, callback) {
  if(!args&&typeof args !== 'object') return;
  let child = execFile(cmd, args, (err, stdout, stderr) => {
    if (err) throw err;
    callback(stdout, stderr)
  })
}
