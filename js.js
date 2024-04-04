let fs        = require('fs'),
/** prefilled with classes that are used in javascript codes */
    attrs     = new Set(['overflow-y-scroll', 'w-full', 'w-1/2', 'opacity-80', '-right-full', 'hidden', 'v-hfull', 'transit', 'invert', 'bg-white', 'text-gray-900']),
    arr       = ['index.html', 'home.html', 'projects.html', 'services.html', 'integrated.html', 'equipment.html', 'partners.html', 'integrated.html', 'portfolio.html', 'contact.html'],
    index     = 0,
    /**utils below will be provided by the user */
    utils     = [''],
    trimCSS  = require('./trim-css'),
    fxn       = nxt=>fs.readFile(nxt, function(err, buf, buffer) {
      let scripts =[], [head, body] = (buffer = buf.toString()).split(/<body[^>]*>/), trimmed, all_attrs=[[]], split=300;
/*
body = (trimmed = body.replace(/<!---::REMOVE::-->[\S\s]+<!---::REMOVE::-->/g, e=>''))
.replace(/<script[\S\s]*>[\S\s]+<\/script>/, e=>(scripts.push(e), ''))
.replace(/(id|src|class|style|on[a-z]+)="[^"]+"/g, e=>(attrs.push(e), '_::_'))
.replace(/>[^<]+</g, (m, i)=>'>'+((m=m.replace(/>|<+/g, '').trim()).length?(fs.appendFileSync('./out.txt', `${m}\t----\t${i}\n`), `::_::`):'')+'<'),
*/
    body.replace(/(id|class)="[^"]+"/g, e=>{
      (e.replace(/(id|class)=|"/g, '').split(' ')).forEach((m, el)=>{
        m=m.replace('&amp;', '&').replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e);
        // if(!~attrs.indexOf(m)) {
          m.trim()&&attrs.add(m)
        // }
      })
    }),
    fs.writeFileSync('trimmed/attrs.txt', [...attrs].join('\n'));
    index<arr.length?fxn(arr[index++]):(
      console.log('::DONE::', attrs.size),
      fs.writeFileSync('trimmed/attrs.txt', [...attrs].join('\n')),
      [...attrs].forEach((e, i)=>{
        i&&i/split===Math.round(i/split)
        ? all_attrs.push([e])
        : all_attrs[all_attrs.length-1].push(e)
        // !i&&all_attrs[all_attrs.length-1].push(e)
      }),
      fs.writeFileSync('trimmed/check.txt', all_attrs.map(e=>e.join('\n')).join('\n')),
      trimCSS(all_attrs, attrs) //, [[...attrs]]
    );
// ['./attrs.txt', [...new Set(attrs)].join('\n'), './html.txt', body, './html.html', head+'<\head>'].forEach((e,i,a)=>(e=a[i*=2])&&fs.writeFile(e, a[i+1], console.log))
  });

  fxn(arr[index++])
