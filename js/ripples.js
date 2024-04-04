let animations = {};


animations.CLASSES = {
  RIPPLE: 'ripple'
};


/**
 * The duration of the ripple animation.
 * @type {number}
 * @const
 */
animations.RIPPLE_DURATION_MS = 800;


/**
 * The max size of the ripple animation.
 * @type {number}
 * @const
 */
animations.RIPPLE_MAX_RADIUS_PX = 300;

//User created constant for a dynamic radius.
animations.RIPPLE_RELATIVE_RADIUS = 0;
let ripple = document.createElement('div'), timeout = 0;
ripple.className = 'absolute p-1 origin-center rounded-full transform-gpu duration-500 ease rounded-full ease origin-center';
 
animations.addRippleAnimations = function() {
  
  let ripple_fn = (event) => {
    let target = event.target;
    const rect = target.getBoundingClientRect();

    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    const corners = [
      {x: 0, y: 0},
      {x: rect.width, y: 0},
      {x: 0, y: rect.height},
      {x: rect.width, y: rect.height},
    ];
    let distance = (x1, y1, x2, y2) => {
      var xDelta = x1 - x2;
      var yDelta = y1 - y2;
      return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
    };
    let cornerDistances = corners.map(function(corner) {
      return Math.round(distance(x, y, corner.x, corner.y));
    });
    const radius = Math.max.apply(Math, cornerDistances);
    let cssText=target.style.cssText, bgColour=getStyle(target, 'color').replace(/rgb/,'rgba'), ripple_scale = +target.getAttribute('data-ripple-scale')||1,
        ripple_opacity=target.getAttribute('data-ripple-opacity')||'0.35';

    if(target != ripple) {
    target.appendChild(ripple);
    ripple.style.cssText = `z-index: 1; --tw-scale-x:1; --tw-scale-y: 1; left:0px; --tw-translate-x:${Math.abs(x)}px; top:0px; --tw-translate-y:${Math.abs(y)}px; background-color: ${bgColour.replace(/\)/, _=>', '+ripple_opacity+')')}`;

/*
    let val = getStyle(target, 'background-color').replace(/rgb/,'rgba').replace(/\)/, ', 0.2)');

    target.style.boxShadow = `${(rect.width - radius/2)%10}px ${(rect.height-radius/2)%10}px 10px 1px ${val}`;
*/

      requestAnimationFrame(_=>['--tw-scale-x', '--tw-scale-y'].forEach(e=>ripple.style.setProperty(e,radius*ripple_scale)))
    }
    window.setTimeout(_=>ripple.style.backgroundColor=bgColour.replace(/\)/, ', 0)'), animations.RIPPLE_DURATION_MS*3/4),
    window.setTimeout(function() {
      ripple.remove();
      ripple.style.cssText = '';

      cssText&&(target.style.cssText=cssText);
    }, animations.RIPPLE_DURATION_MS);
  }

  let ripples = qsa('.' + animations.CLASSES.RIPPLE);

  for (let i = 0, j = ripples.length; i < j; i++) {
    ripples[i].addEventListener('mousedown', ripple_fn);
  }
}