let fs = require('fs');
/*Vercel requires that a public folder is created after the build script is run
hence the faux operation below
*/
!fs.existsSync('public')&&fs.mkdirSync('public')
