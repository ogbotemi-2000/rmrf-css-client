function onScroll(page, mthd, sTop, t) {
  !(t = onScroll).lastY&&(t.lastY=0), sTop = page.scrollY||page.scrollTop,
  mthd = cLs, window.topCta&&['show', 'relative', 'absolute']
  .forEach((e, i, a, cls)=>{(cls = topCta.classList)[mthd(heap = sTop < t.lastY)](e),
    i===2&&cls[mthd(!heap)](e), i===1&&cls[mthd(heap)](e)
  }),
  setTimeout(_=>t.lastY=sTop);
  return t.lastY/(page.scrollHeight||innerHeight)
}