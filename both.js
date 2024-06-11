//functions used both client side and server side goes here

let inBrowser=this.window,
both = {

  getAttrs: function(buf, attrs, cb, selectors={}, loop, valid, html) {
    /* using an object of selectors to enforce uniqueness similar to a Set*/
    loop=this.loop, valid = str=>!+str.replace(/\./g, '')&&!/\/[a-z]|[A-Z]|;|\\|^(_|--|:|\||=|\!|\+|\$|;|\/|#|\.|>|\&)|@|\+|\?|\{|\}|\%|,|\/\/|<|(\||=|\!|\+|\/|-|:|\[|\]|\$|#|\.|>|\&|_)$|\(|\)/g.test(str),
    attrs ||= ['class', 'id'];/* attributes believed to store used selectors */
    for(let i=0, value, j=(html = buf.toString()).length, res; i<j; i++) {
      attrs.forEach(attr=>{
        /* store strings for the length of the current attr and see whether they are the same */
        if((res = loop(html, {from:i, to:attr.length+1}))[0]===attr+'='&&/'|"/.test(html.charAt(res[1]+1))) {
          /* the current index points to an opening quote, incrementing it points to the characters after it which are then
              added together till the character just before the closing quote
          */
          (value = loop(html, {from:res[1]+2, cb:(s,f)=>/'|"/.test(s[f])}))[0].trim()&&(i=value[1], value[0].trim()).split(/\s/)
          .forEach(val=>(val = val.trim())&&valid(val)&&(selectors[val.replace(/^[0-9]+|\.|\/|\[|\]|\&|\*|\:|\>/g, e=>'\\'+e)] = val))
        }
      })
    }
    return Object.keys(selectors);
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
loop: function(str, props, from, to, cb, len) {
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