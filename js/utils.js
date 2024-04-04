/*remove in production
save(new Blob(['<!DOCTYPE HTML>'+html.outerHTML], { type: 'text/html' }), location.pathname.split('/').pop())
*/
function save(blob, name) {
    name = name || 'download';

    // Use native saveAs in IE10+
    if (typeof navigator !== "undefined") {
        if (/MSIE [1-9]\./.test(navigator.userAgent)) {
            alert('IE is unsupported before IE10');
            return;
        }
        if (navigator.msSaveOrOpenBlob) {
            // https://msdn.microsoft.com/en-us/library/hh772332(v=vs.85).aspx
            alert('will download using IE10+ msSaveOrOpenBlob');
            navigator.msSaveOrOpenBlob(blob, name);
            return;
        }
    }

    // Construct URL object from blob
    var win_url = window.URL || window.webkitURL || window;
    var url = win_url.createObjectURL(blob);

    // Use a.download in HTML5
    var a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    if ('download'in a) {
        alert('will download using HTML5 a.download');
        a.href = url;
        a.download = name;
        a.dispatchEvent(new MouseEvent('click'));
        // Don't revoke immediately, as it may prevent DL in some browsers
        setTimeout(function() {
            win_url.revokeObjectURL(url);
        }, 500);
        return;
    }

    // Use object URL directly
    window.location.href = url;
    // Don't revoke immediately, as it may prevent DL in some browsers
    setTimeout(function() {
        win_url.revokeObjectURL(url);
    }, 500);
}
/*end*/


/*globals*/
(objWalk.setDict =function(arr){
  objWalk.dict||={};
  if(arr) for(let str, val, i = arr.length; i;  str=(val=arr[--i]).charAt(0), val.replace(/[A-Z]/g, _=>str+=_), objWalk.dict[str]=val);
})(['textContent', 'classList', 'previousSibling', 'nextSibling',  'lastChild', 'firstChild', 'nextElementSibling', 'previousElementSibling', 'parentNode', 'lastElementChild', 'childNodes', 'firstElementChild']);

const w=window, d=document, F=Function,prot =obj=>obj.prototype,prot_F=prot(F), cLs=cnd=>cnd?'add':'remove',
mDize =obj=>prot_F.call.bind(obj),O=Object,prot_O = prot(O),_toString = mDize(prot_O.toString),
  A = Array, prot_A = prot(A), qs=str=>d.querySelector(str), qsa=str=>d.querySelectorAll(str),
  slice = mDize(prot_A.slice),
  cloneNode = mDize(d.cloneNode),
  gC = w.getComputedStyle, html = d.documentElement, getStyle=(el, prop)=>gC(el)[prop],
  map = mDize([].map), vw_breaks = [500, 640, 768, 1024, 1280], forEach = mDize(prot_A.forEach), filter = mDize(prot_A.filter), find=mDize(prot_A.find);

/*self contained component*/
function grow_shrink(e,i,c,n,d,k, cls){
  d=grow_shrink,n={500:'base',640:'sm',768:'md',1024:'lg',1280:'xl'},
  c=document.createElement("div"),
  d.cached||={},d.arr||=[].slice.call((d.el=window.growShrink).querySelectorAll(".fluid")),
  d.dump||=d.el.querySelector("a+div>div"),
  (e=(k=Object.keys(n).filter((c,n)=>(i=n,c>e)))[0]), k = new RegExp(k.map(e=>n[e]+':show').join('|')),
  d.vw!==e&&!d.cached[d.vw=e]&&d.arr.forEach((n,r,o)=>{
    (n=n.cloneNode(!0)).classList.add(c.className=d.el.getAttribute('data-className'));
    if(((cls=n.classList)+'').match(k)) cls.remove('clicked'), (cls+'').replace(/(base|sm|md|lg|xl):show/, function(a) {
      cls.remove(a, 'fluid')
    }), /* n.className=l?"clicked":"",*/ c.appendChild(n), d.cached[e]||=c
  }),d.dump.replaceChild(d.cached[e]||c,d.dump.firstChild)}

console.time('DOMContentLoaded')
window.addEventListener('DOMContentLoaded', _=>{
  window.growShrink&&(grow_shrink(innerWidth), this.onresize=_=>grow_shrink(innerWidth))
});

/*end*/

  function relation(parent, child) {
      return [parent.compareDocumentPosition(child)&Node.DOCUMENT_POSITION_CONTAINED_BY,
              parent.compareDocumentPosition(child)&Node.DOCUMENT_POSITION_CONTAINS]
  }
  function Is(entity, type) {
      let a = entity==void 0?_toString(entity).replace(/\[object |\]/g ,''):entity.constructor.name
      return (type?(type === a || a.toUpperCase()===type.toUpperCase()):a)
  }
  function objWalk(e,a,logStack) {
    let errs=[], trace=[], is_a=Is(a), and=_=>_!==void 0&&_, dict=objWalk.dict;
   
    objWalk.walk_arr=function(e,a,logStack){let i=0; if(Is(a,'Array')) for(let val, j=a.length; (e=Is(val=dict[a[i]]||a[i],'Object')?this.walk_obj(e,val):and(e[val])||(logStack&&errs.push(`${e[dict[a[i-1]]||a[i-1]]} for ${dict[a[i-1]]||a[i-1]} at index ${i-1}`),e))&&(i++, i<j);); return e},
    objWalk.walk_obj=function(e,a,logStack){if(Is(a,'object')) for(let key in a) for(let val, j=+key; j--;) e=Is(val=dict[a[key]]||a[key],'String')?and(e[val])||e:this.walk_arr(e,val, logStack)/*▶*/; return e};
   
    switch(is_a) {
      case 'Object':
        e=objWalk.walk_obj(e,a,logStack)
      break;
      case 'Array':
        e=objWalk.walk_arr(e,a,logStack)
      break;
      case 'String':
        e=e[dict[a]]||e[a]
      break
    }
    return logStack?{e,errs}:e
  }