/* =========================================================
   NÁBYTEK — programaticky kreslený, větší rozměry pro 24px tile
   ========================================================= */

import { PAL } from './palette.js';
import { makeCanvas, fillEllipse, rect, px, hline, vline } from './primitives.js';

/* GAUČ — 96×48 (4×2 tiles) */
function buildSofa(){
  const { c, cx } = makeCanvas(96, 48);
  // stín pod
  rect(cx, 4, 44, 92, 4, 1);
  // tělo gauče - tmavě zelený
  rect(cx, 0, 12, 96, 32, 21);
  rect(cx, 0, 12, 96, 4, 22);            // top highlight
  rect(cx, 0, 40, 96, 4, 16);            // bottom shadow

  // opěrka zad
  rect(cx, 0, 0, 96, 16, 22);
  rect(cx, 0, 0, 96, 4, 23);             // top
  rect(cx, 0, 12, 96, 2, 16);            // bottom shadow

  // boční opěrky
  rect(cx, 0, 8, 12, 36, 22);
  rect(cx, 0, 8, 12, 4, 23);
  rect(cx, 84, 8, 12, 36, 22);
  rect(cx, 84, 8, 12, 4, 23);

  // polštáře (3)
  for(let i=0;i<3;i++){
    const px0 = 14 + i*24;
    rect(cx, px0, 16, 22, 24, 23);
    rect(cx, px0, 16, 22, 2, 24);        // top highlight
    rect(cx, px0, 38, 22, 2, 16);
    // detail швы
    px(cx, px0+11, 28, 22);
  }

  // nožičky
  rect(cx, 4, 44, 4, 4, 0);
  rect(cx, 88, 44, 4, 4, 0);
  return c;
}

/* STŮL — 72×48 (3×2 tiles) */
function buildTable(){
  const { c, cx } = makeCanvas(72, 48);
  // stín
  rect(cx, 4, 44, 64, 4, 1);
  // deska
  rect(cx, 0, 4, 72, 12, 22);            // tmavá vrstva
  rect(cx, 0, 4, 72, 4, 24);             // top highlight
  rect(cx, 0, 14, 72, 2, 22);
  // wood grain
  hline(cx, 8, 6, 56, 23);
  hline(cx, 16, 10, 48, 23);
  hline(cx, 4, 12, 60, 23);

  // nohy
  rect(cx, 4, 16, 6, 28, 22);
  rect(cx, 4, 16, 2, 28, 23);
  rect(cx, 62, 16, 6, 28, 22);
  rect(cx, 62, 16, 2, 28, 23);
  return c;
}

/* POSTEL — 72×96 (3×4 tiles) */
function buildBed(){
  const { c, cx } = makeCanvas(72, 96);
  // rám postele
  rect(cx, 0, 8, 72, 88, 22);
  rect(cx, 0, 8, 72, 4, 23);
  rect(cx, 0, 92, 72, 4, 16);

  // čelo
  rect(cx, 0, 0, 72, 16, 23);
  rect(cx, 0, 0, 72, 4, 24);             // top
  // dekorativní pruhy na čele
  hline(cx, 8, 8, 56, 22);
  hline(cx, 8, 12, 56, 22);

  // matrace
  rect(cx, 4, 16, 64, 72, 6);            // bílá
  rect(cx, 4, 16, 64, 4, 7);             // top highlight

  // peřina (modro-bílá pruhovaná)
  rect(cx, 4, 36, 64, 48, 30);
  for(let i=0;i<5;i++){
    hline(cx, 4, 38+i*10, 64, 31);       // světle modré pruhy
  }

  // polštář
  rect(cx, 8, 20, 56, 16, 7);
  rect(cx, 8, 20, 56, 2, 6);
  rect(cx, 8, 32, 56, 2, 8);

  // nohy
  rect(cx, 0, 92, 8, 4, 0);
  rect(cx, 64, 92, 8, 4, 0);
  return c;
}

/* LEDNICE — 48×72 (2×3 tiles) */
function buildFridge(){
  const { c, cx } = makeCanvas(48, 72);
  // stín
  rect(cx, 4, 68, 40, 4, 1);
  // tělo
  rect(cx, 0, 0, 48, 72, 8);
  rect(cx, 0, 0, 48, 4, 6);              // top highlight
  rect(cx, 0, 68, 48, 4, 9);             // bottom shadow
  rect(cx, 44, 0, 4, 72, 9);             // right shadow
  rect(cx, 0, 0, 4, 72, 6);              // left highlight

  // dělící linie (mraznička/lednice)
  rect(cx, 0, 24, 48, 2, 9);
  rect(cx, 0, 26, 48, 1, 0);

  // kliky
  rect(cx, 40, 12, 3, 8, 0);
  rect(cx, 40, 36, 3, 8, 0);

  // displej / štítek
  rect(cx, 6, 6, 12, 4, 30);
  px(cx, 8, 8, 16);
  return c;
}

/* SPORÁK — 48×48 (2×2 tiles) */
function buildStove(){
  const { c, cx } = makeCanvas(48, 48);
  // stín
  rect(cx, 4, 44, 40, 4, 1);
  // tělo - tmavá
  rect(cx, 0, 0, 48, 48, 9);
  rect(cx, 0, 0, 48, 4, 8);
  rect(cx, 0, 44, 48, 4, 10);

  // pozadí varné desky (černé)
  rect(cx, 4, 8, 40, 28, 0);
  // 4 plotýnky
  for(let r=0;r<2;r++){
    for(let cl=0;cl<2;cl++){
      const cx0 = 14 + cl*20;
      const cy0 = 16 + r*12;
      fillEllipse(cx, cx0, cy0, 6, 4, 1);
      fillEllipse(cx, cx0, cy0, 5, 3, 11);
      fillEllipse(cx, cx0, cy0, 3, 2, 0);
    }
  }
  // ovladače dole
  for(let i=0;i<4;i++){
    fillEllipse(cx, 8+i*10, 42, 2, 2, 0);
    px(cx, 8+i*10, 41, 6);
  }
  return c;
}

/* TELEVIZE — 48×48 (2×2) */
function buildTV(){
  const { c, cx } = makeCanvas(48, 48);
  // stín
  rect(cx, 4, 44, 40, 4, 1);
  // rám
  rect(cx, 0, 0, 48, 38, 0);
  rect(cx, 0, 0, 48, 2, 11);             // top highlight
  // obrazovka
  rect(cx, 4, 4, 40, 28, 30);
  rect(cx, 4, 4, 40, 2, 31);             // top
  // odlesk
  rect(cx, 6, 6, 8, 2, 6);
  px(cx, 14, 6, 6);
  // vzor na obrazovce (rušení/program)
  for(let y=10;y<30;y+=4){
    hline(cx, 6, y, Math.random() > 0.3 ? 36 : 20, 6);
  }
  // stojan
  rect(cx, 18, 38, 12, 4, 0);
  rect(cx, 12, 42, 24, 4, 11);
  return c;
}

/* STROM — 48×72 */
function buildTree(){
  const { c, cx } = makeCanvas(48, 72);
  // stín
  fillEllipse(cx, 24, 70, 18, 3, 1);
  // kmen
  rect(cx, 18, 36, 12, 32, 22);
  rect(cx, 18, 36, 4, 32, 23);           // light side
  rect(cx, 26, 36, 4, 32, 16);           // dark side
  // textura kmene
  hline(cx, 19, 42, 10, 22);
  hline(cx, 20, 50, 8, 22);
  hline(cx, 19, 58, 10, 22);

  // koruna - vrstvy
  fillEllipse(cx, 24, 18, 22, 18, 26);   // tmavě zelená
  fillEllipse(cx, 24, 16, 20, 16, 27);   // střední
  fillEllipse(cx, 22, 14, 14, 12, 28);   // light highlight
  fillEllipse(cx, 20, 12, 8, 6, 29);     // top highlight

  // detail listů (tečky)
  px(cx, 12, 22, 28);
  px(cx, 36, 22, 28);
  px(cx, 8, 16, 27);
  px(cx, 40, 16, 27);
  return c;
}

/* KEŘ — 36×30 */
function buildBush(){
  const { c, cx } = makeCanvas(36, 30);
  // stín
  fillEllipse(cx, 18, 28, 14, 2, 1);
  // tělo
  fillEllipse(cx, 18, 18, 16, 11, 26);
  fillEllipse(cx, 14, 14, 10, 8, 27);    // L cluster
  fillEllipse(cx, 22, 16, 10, 8, 27);    // R cluster
  fillEllipse(cx, 16, 12, 6, 5, 28);     // L highlight
  fillEllipse(cx, 24, 14, 5, 4, 28);     // R highlight
  // detaily
  px(cx, 8, 20, 28);
  px(cx, 28, 22, 28);
  px(cx, 18, 24, 27);
  return c;
}

/* MISKA — 30×16 */
function buildBowl(){
  const { c, cx } = makeCanvas(30, 16);
  // miska
  fillEllipse(cx, 15, 12, 14, 4, 16);    // venek
  fillEllipse(cx, 15, 11, 13, 3, 17);
  fillEllipse(cx, 15, 11, 11, 2, 6);     // vnitřek (granule)
  // obsah - granule
  px(cx, 11, 11, 22);
  px(cx, 13, 10, 24);
  px(cx, 15, 11, 22);
  px(cx, 17, 10, 24);
  px(cx, 19, 11, 22);
  return c;
}

/* KUCHYŇSKÁ LINKA — generický counter, kreslíme v render */
/* (nepotřebuje canvas, je to obdélník + dřez navrch) */

export const SOFA_CANVAS   = buildSofa();
export const TABLE_CANVAS  = buildTable();
export const BED_CANVAS    = buildBed();
export const FRIDGE_CANVAS = buildFridge();
export const STOVE_CANVAS  = buildStove();
export const TV_CANVAS     = buildTV();
export const TREE_CANVAS   = buildTree();
export const BUSH_CANVAS   = buildBush();
export const BOWL_CANVAS   = buildBowl();

export function getFurnitureCanvas(type){
  switch(type){
    case 'sofa':    return SOFA_CANVAS;
    case 'table':   return TABLE_CANVAS;
    case 'bed':     return BED_CANVAS;
    case 'fridge':  return FRIDGE_CANVAS;
    case 'stove':   return STOVE_CANVAS;
    case 'tv':      return TV_CANVAS;
    case 'tree':    return TREE_CANVAS;
    case 'bush':    return BUSH_CANVAS;
    case 'bowl':    return BOWL_CANVAS;
    case 'counter': return null;  // kreslí se přímo v render
  }
  return null;
}
