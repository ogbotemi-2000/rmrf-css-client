let {PurgeCSS} = require("purgecss"),
    fs 	       = require('fs');

console.time('::DONE:: in ');
(async function() {
const purgeCSSResult = await new PurgeCSS().purge({
  content: ['index.html'],
  css: ['css/tailwind.min.css']
})

  console.timeEnd('::DONE:: in '),
  fs.writeFileSync('trimmed/tailwind.min.css', purgeCSSResult[0].css)
})()
