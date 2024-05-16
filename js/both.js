//functions used both client side and server side goes here

let inBrowser=this.window,
both = {

  getAttrs: function(buf, rgx, cb, matches_arr=[]) {
    rgx||=[/(id|class)=('|")[^("|')]+('|")/g, /(id|class)=|"/g],
    buf.replace(rgx[0], e=>{
      (e.replace(rgx[1], '').split(' ')).forEach((m, el)=>{
        m=m.replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e).replace(/("|')/g, '').trim();
        if(m&&!~matches_arr.indexOf(m)) {
          matches_arr.push(m), cb&&cb(m)
        }
      })
    });
    return matches_arr;
  },
  validateEmail:function(e) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return re.test(e);
  },
  timeEqual: function(a,b) {
	var mismatch = 0;
	if(a.length !== b.length) return mismatch;	
	  for (var i = 0; i < a.length; ++i) {
		mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
	  }
	  return mismatch;
	},
  byteFormat: function(num, res='') {
  if(num <1024) {
    res = num+' bytes';
  } else if(1024 <=num && num < 1048576) {
    res += num/1024,
    res = res.slice(0, res.indexOf('.')+3) /*3-1 dp*/+' KB'
  } else {
    res += num/1048576,
    res = res.slice(0, res.indexOf('.')+3) /*3-1 dp*/+' MB'
  }
  return res
},
loop: function(str, props, from, to, cb) {
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
}

if(!inBrowser) module.exports = both;