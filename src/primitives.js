/* =========================================================
   PRIMITIVES — pixel-perfect kreslicí helpery
   Pro programové kreslení sprajtů místo pixel-by-pixel string artu.
   Vše respektuje pixel grid (žádný antialiasing).
   ========================================================= */

import { PAL } from './palette.js';

/* Vytvoří off-screen canvas dané velikosti a vrátí (canvas, ctx). */
export function makeCanvas(w, h){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  return { c, cx };
}

/* Vyplněný kruh metodou rasterizace (pixel-perfect, žádný AA). */
export function fillCircle(cx, x, y, r, palIdx){
  cx.fillStyle = PAL[palIdx];
  for(let dy = -r; dy <= r; dy++){
    for(let dx = -r; dx <= r; dx++){
      if(dx*dx + dy*dy <= r*r) cx.fillRect(x+dx, y+dy, 1, 1);
    }
  }
}

/* Vyplněný ovál (rx, ry mohou být různé). */
export function fillEllipse(cx, x, y, rx, ry, palIdx){
  cx.fillStyle = PAL[palIdx];
  for(let dy = -ry; dy <= ry; dy++){
    for(let dx = -rx; dx <= rx; dx++){
      if((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) <= 1) cx.fillRect(x+dx, y+dy, 1, 1);
    }
  }
}

/* Polovyplněný ovál (jen horní/dolní/levá/pravá polovina). side: 'top','bot','left','right' */
export function fillHalfEllipse(cx, x, y, rx, ry, palIdx, side){
  cx.fillStyle = PAL[palIdx];
  for(let dy = -ry; dy <= ry; dy++){
    for(let dx = -rx; dx <= rx; dx++){
      if((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) > 1) continue;
      if(side === 'top'   && dy > 0) continue;
      if(side === 'bot'   && dy < 0) continue;
      if(side === 'left'  && dx > 0) continue;
      if(side === 'right' && dx < 0) continue;
      cx.fillRect(x+dx, y+dy, 1, 1);
    }
  }
}

/* Obdélník (alias pro čitelnost). */
export function rect(cx, x, y, w, h, palIdx){
  cx.fillStyle = PAL[palIdx];
  cx.fillRect(x, y, w, h);
}

/* Jediný pixel. */
export function px(cx, x, y, palIdx){
  cx.fillStyle = PAL[palIdx];
  cx.fillRect(x, y, 1, 1);
}

/* Horizontální linka. */
export function hline(cx, x, y, w, palIdx){
  cx.fillStyle = PAL[palIdx];
  cx.fillRect(x, y, w, 1);
}

/* Vertikální linka. */
export function vline(cx, x, y, h, palIdx){
  cx.fillStyle = PAL[palIdx];
  cx.fillRect(x, y, 1, h);
}

/* Vrátí horizontálně otočený canvas. */
export function flipH(canv){
  const c = document.createElement('canvas');
  c.width = canv.width; c.height = canv.height;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.translate(canv.width, 0);
  cx.scale(-1, 1);
  cx.drawImage(canv, 0, 0);
  return c;
}
