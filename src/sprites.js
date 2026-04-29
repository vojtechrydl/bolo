/* =========================================================
   SPRITY — programově kreslené, 24×24 a 24×32 pro postavy
   Větší rozlišení, plynulejší křivky, ale pořád pixel-perfect.
   ========================================================= */

import { spr, prerender } from './palette.js';
import {
  makeCanvas, fillCircle, fillEllipse, fillHalfEllipse,
  rect, px, hline, vline, flipH
} from './primitives.js';

/* =========================================================
   BOLO — 24×24
   Pohledy: down (čelní), up (záda), right, left
   Každý směr 2 framy (frame 0 = stojící, frame 1 = krok)
   ========================================================= */

function drawBoloHead(cx, ox, oy, dir){
  // dir: 'down', 'up', 'right'
  // hlava 14×11, vystředěná na ox, oy

  if(dir === 'down'){
    // klopené uši - po stranách, padající dolů
    fillEllipse(cx, ox-7, oy+1, 3, 5, 1);   // L ucho - tmavá
    fillEllipse(cx, ox-7, oy+1, 2, 4, 2);   // L ucho - mid
    fillEllipse(cx, ox+7, oy+1, 3, 5, 1);   // R ucho
    fillEllipse(cx, ox+7, oy+1, 2, 4, 2);

    // hlava - kudrnatá srst (víc oválů pro nepravidelný tvar)
    fillCircle(cx, ox, oy, 7, 1);           // outline tmavá
    fillCircle(cx, ox, oy-1, 6, 2);         // tělo hlavy
    fillEllipse(cx, ox, oy-2, 5, 4, 3);     // highlight
    fillEllipse(cx, ox-2, oy-3, 3, 2, 4);   // top-left highlight
    fillEllipse(cx, ox+2, oy-3, 2, 2, 4);   // top-right highlight
    // kudrnaté detaily
    px(cx, ox-4, oy-4, 4);
    px(cx, ox+4, oy-4, 4);
    px(cx, ox-3, oy-1, 4);
    px(cx, ox+3, oy-1, 4);

    // oči (2x2)
    rect(cx, ox-3, oy-1, 2, 2, 6);          // L oko bílá
    rect(cx, ox+1, oy-1, 2, 2, 6);          // R oko bílá
    px(cx, ox-2, oy, 0);                    // L pupila
    px(cx, ox+2, oy, 0);                    // R pupila
    px(cx, ox-3, oy-1, 6);                  // L catchlight
    px(cx, ox+1, oy-1, 6);                  // R catchlight

    // nos
    rect(cx, ox-1, oy+2, 2, 2, 0);
    px(cx, ox, oy+1, 6);                    // odlesk na nose

    // pusa
    px(cx, ox-1, oy+4, 0);
    px(cx, ox, oy+4, 0);
    px(cx, ox+1, oy+4, 0);
    // růžový jazyk občas
    px(cx, ox, oy+5, 17);
  } else if(dir === 'up'){
    // záda hlavy - jen kudrnatá srst, žádné oči
    fillEllipse(cx, ox-7, oy+1, 3, 5, 1);
    fillEllipse(cx, ox-7, oy+1, 2, 4, 2);
    fillEllipse(cx, ox+7, oy+1, 3, 5, 1);
    fillEllipse(cx, ox+7, oy+1, 2, 4, 2);

    fillCircle(cx, ox, oy, 7, 1);
    fillCircle(cx, ox, oy-1, 6, 2);
    fillEllipse(cx, ox, oy-2, 5, 4, 3);
    // víc kudrnatých detailů (vidíme pouze srst)
    px(cx, ox-3, oy-3, 4);
    px(cx, ox-1, oy-3, 4);
    px(cx, ox+1, oy-3, 4);
    px(cx, ox+3, oy-3, 4);
    px(cx, ox-4, oy-1, 4);
    px(cx, ox+4, oy-1, 4);
    px(cx, ox-2, oy+1, 4);
    px(cx, ox+2, oy+1, 4);
  } else if(dir === 'right'){
    // hlava z boku - protáhlá tlama
    fillEllipse(cx, ox, oy-1, 6, 5, 1);     // outline
    fillEllipse(cx, ox, oy-1, 5, 4, 2);     // body
    fillEllipse(cx, ox+1, oy-2, 3, 3, 3);   // top hlight
    fillEllipse(cx, ox+2, oy-3, 2, 1, 4);   // top tip

    // ucho - klopené, padá dolů
    fillEllipse(cx, ox-3, oy, 3, 4, 1);
    fillEllipse(cx, ox-2, oy, 2, 3, 2);

    // tlama (vyčnívá vpředu)
    fillEllipse(cx, ox+5, oy+1, 3, 2, 2);
    fillEllipse(cx, ox+5, oy+1, 2, 1, 3);
    rect(cx, ox+6, oy, 2, 1, 0);             // nos

    // oko
    rect(cx, ox+2, oy-1, 2, 2, 6);
    px(cx, ox+3, oy, 0);
    px(cx, ox+2, oy-1, 6);                   // catchlight

    // pusa
    px(cx, ox+5, oy+2, 0);
    px(cx, ox+6, oy+2, 0);
  }
}

function drawBoloBody(cx, ox, oy, dir, frame){
  // tělo (cca 12×8), pozice ox=střed dole

  if(dir === 'down'){
    // tělo - tmavý ovál
    fillEllipse(cx, ox, oy, 7, 5, 2);
    fillEllipse(cx, ox, oy-1, 6, 4, 3);
    // bílá náprsenka
    fillEllipse(cx, ox, oy, 4, 3, 6);
    fillEllipse(cx, ox, oy-1, 3, 2, 7);

    // přední packy
    if(frame === 0){
      rect(cx, ox-5, oy+4, 2, 2, 1);
      rect(cx, ox+3, oy+4, 2, 2, 1);
    } else {
      rect(cx, ox-5, oy+3, 2, 3, 1);
      rect(cx, ox+3, oy+3, 2, 3, 1);
    }
  } else if(dir === 'up'){
    // záda - tmavý ovál bez náprsenky
    fillEllipse(cx, ox, oy, 7, 5, 2);
    fillEllipse(cx, ox, oy-1, 6, 4, 3);
    fillEllipse(cx, ox, oy-1, 4, 3, 4);     // ridge highlight

    // ocásek - kudrnatý nahoru-doprava
    px(cx, ox+3, oy-6, 2);
    px(cx, ox+4, oy-6, 2);
    px(cx, ox+5, oy-5, 2);
    px(cx, ox+5, oy-4, 2);
    px(cx, ox+4, oy-3, 3);  // highlight

    // zadní packy (u země)
    if(frame === 0){
      rect(cx, ox-5, oy+4, 2, 2, 1);
      rect(cx, ox+3, oy+4, 2, 2, 1);
    } else {
      rect(cx, ox-5, oy+3, 2, 3, 1);
      rect(cx, ox+3, oy+3, 2, 3, 1);
    }
  } else if(dir === 'right'){
    // tělo z boku - protáhlé doleva (zadek), hlava napravo
    fillEllipse(cx, ox-2, oy, 8, 4, 2);
    fillEllipse(cx, ox-2, oy-1, 7, 3, 3);
    // bílá náprsenka (jen vepředu, kde je hruď)
    fillEllipse(cx, ox+2, oy, 3, 2, 6);

    // ocásek vlevo (kudrnatý)
    px(cx, ox-9, oy-2, 2);
    px(cx, ox-9, oy-3, 2);
    px(cx, ox-8, oy-4, 2);
    px(cx, ox-7, oy-4, 3);

    // nohy - 4 (přední pár ovládáno frame, zadní stojí)
    if(frame === 0){
      rect(cx, ox-5, oy+3, 2, 3, 1);  // zadní L
      rect(cx, ox-2, oy+3, 2, 3, 1);  // zadní R
      rect(cx, ox+2, oy+3, 2, 3, 1);  // přední L
      rect(cx, ox+5, oy+3, 2, 3, 1);  // přední R
    } else {
      rect(cx, ox-5, oy+3, 2, 2, 1);
      rect(cx, ox-2, oy+3, 2, 3, 1);
      rect(cx, ox+2, oy+3, 2, 3, 1);
      rect(cx, ox+5, oy+3, 2, 2, 1);
    }
  }
}

function makeBoloDown(frame){
  const { c, cx } = makeCanvas(24, 24);
  drawBoloBody(cx, 12, 16, 'down', frame);
  drawBoloHead(cx, 12, 8, 'down');
  return c;
}

function makeBoloUp(frame){
  const { c, cx } = makeCanvas(24, 24);
  drawBoloBody(cx, 12, 16, 'up', frame);
  drawBoloHead(cx, 12, 8, 'up');
  return c;
}

function makeBoloRight(frame){
  const { c, cx } = makeCanvas(24, 24);
  drawBoloBody(cx, 10, 14, 'right', frame);
  drawBoloHead(cx, 17, 9, 'right');
  return c;
}

export const BOLO_DOWN  = [makeBoloDown(0), makeBoloDown(1)];
export const BOLO_UP    = [makeBoloUp(0), makeBoloUp(1)];
export const BOLO_RIGHT = [makeBoloRight(0), makeBoloRight(1)];
export const BOLO_LEFT  = [flipH(BOLO_RIGHT[0]), flipH(BOLO_RIGHT[1])];

/* Bolo schovaný (jen vykukuje hlava nad nábytkem) */
export const BOLO_HIDE = (() => {
  const { c, cx } = makeCanvas(24, 16);
  // jen vrch hlavy a oči, jako by byl pod stolem
  fillEllipse(cx, 12, 12, 7, 4, 1);
  fillEllipse(cx, 12, 11, 6, 3, 2);
  fillEllipse(cx, 12, 10, 5, 2, 3);
  // uši
  fillEllipse(cx, 5, 11, 2, 3, 1);
  fillEllipse(cx, 19, 11, 2, 3, 1);
  // oči vykukující
  rect(cx, 9, 10, 2, 2, 6);
  rect(cx, 13, 10, 2, 2, 6);
  px(cx, 10, 11, 0);
  px(cx, 14, 11, 0);
  // detaily srsti
  px(cx, 8, 9, 4);
  px(cx, 12, 8, 4);
  px(cx, 16, 9, 4);
  return c;
})();

/* Bolo smutný (Game Over) - sed, klopené uši, vidící dolů */
export const BOLO_SAD = (() => {
  const { c, cx } = makeCanvas(32, 36);
  // tělo (sedící)
  fillEllipse(cx, 16, 28, 10, 6, 2);
  fillEllipse(cx, 16, 27, 9, 5, 3);
  // bílá náprsenka
  fillEllipse(cx, 16, 27, 5, 4, 6);
  fillEllipse(cx, 16, 26, 4, 3, 7);
  // hlava
  fillCircle(cx, 16, 16, 9, 1);
  fillCircle(cx, 16, 15, 8, 2);
  fillEllipse(cx, 16, 14, 7, 5, 3);
  fillEllipse(cx, 14, 12, 4, 3, 4);
  // klopené uši (delší, smutné)
  fillEllipse(cx, 7, 19, 3, 6, 1);
  fillEllipse(cx, 7, 19, 2, 5, 2);
  fillEllipse(cx, 25, 19, 3, 6, 1);
  fillEllipse(cx, 25, 19, 2, 5, 2);
  // smutné oči (zavřené - linky)
  hline(cx, 11, 17, 3, 0);
  hline(cx, 18, 17, 3, 0);
  // slza
  px(cx, 12, 19, 31);
  px(cx, 12, 20, 31);
  // nos
  rect(cx, 15, 19, 2, 2, 0);
  // smutná pusa (dolů)
  px(cx, 13, 22, 0);
  px(cx, 14, 23, 0);
  px(cx, 15, 23, 0);
  px(cx, 16, 23, 0);
  px(cx, 17, 23, 0);
  px(cx, 18, 22, 0);
  // packy
  rect(cx, 10, 32, 3, 3, 1);
  rect(cx, 19, 32, 3, 3, 1);
  return c;
})();

/* Bolo BIG (title screen) - velký 4x scaled */
export const BOLO_BIG = (() => {
  const big = makeBoloDown(0);
  const { c, cx } = makeCanvas(big.width * 3, big.height * 3);
  cx.imageSmoothingEnabled = false;
  cx.drawImage(big, 0, 0, big.width * 3, big.height * 3);
  return c;
})();

/* =========================================================
   PANIČKA — 24×36 (vyšší)
   Hlava + tělo + nohy
   ========================================================= */

function drawOwnerHead(cx, ox, oy, dir){
  if(dir === 'down'){
    // vlasy (hnědé)
    fillCircle(cx, ox, oy-1, 6, 14);
    fillEllipse(cx, ox, oy-3, 6, 3, 13);    // top
    // obličej
    fillCircle(cx, ox, oy+1, 5, 12);        // skin
    fillEllipse(cx, ox, oy+2, 4, 3, 12);    // chin highlight
    // vlasy přes čelo
    hline(cx, ox-5, oy-2, 11, 14);
    hline(cx, ox-5, oy-1, 11, 14);
    px(cx, ox-4, oy, 14);
    px(cx, ox+4, oy, 14);
    // oči
    px(cx, ox-2, oy+1, 0);
    px(cx, ox+2, oy+1, 0);
    // pusa (úsměv)
    px(cx, ox-1, oy+3, 15);
    px(cx, ox, oy+3, 15);
    px(cx, ox+1, oy+3, 15);
    // tváře (lehké zarudnutí)
    px(cx, ox-3, oy+2, 17);
    px(cx, ox+3, oy+2, 17);
  } else if(dir === 'up'){
    // záda hlavy - jen vlasy
    fillCircle(cx, ox, oy, 6, 14);
    fillEllipse(cx, ox, oy-1, 5, 4, 13);
    // krk dole
    rect(cx, ox-1, oy+5, 3, 1, 12);
  } else if(dir === 'right'){
    // hlava z boku
    fillCircle(cx, ox, oy, 5, 14);          // vlasy outline
    fillEllipse(cx, ox-1, oy+1, 4, 4, 12);  // obličej
    fillEllipse(cx, ox, oy-2, 4, 2, 13);    // top vlasy
    // vlasy padají dozadu
    px(cx, ox-4, oy, 14);
    px(cx, ox-4, oy+1, 14);
    px(cx, ox-3, oy+2, 14);
    // oko
    px(cx, ox+1, oy+1, 0);
    // pusa
    px(cx, ox+2, oy+3, 15);
    // nos
    px(cx, ox+3, oy+1, 13);
  }
}

function drawOwnerBody(cx, ox, oy, dir, frame){
  // tělo (tričko) cca 10×12, pozice ox=střed, oy=top těla

  if(dir === 'down' || dir === 'up'){
    // tričko - žluté
    fillEllipse(cx, ox, oy+5, 7, 7, 19);    // tělo
    fillEllipse(cx, ox, oy+4, 6, 6, 20);    // detail tmavší pas
    rect(cx, ox-5, oy, 11, 4, 19);          // ramena/krk
    // kalhoty - modré
    rect(cx, ox-5, oy+10, 11, 4, 30);
    fillEllipse(cx, ox, oy+11, 5, 2, 31);
    // ruce (po stranách)
    rect(cx, ox-7, oy+3, 2, 6, 19);
    rect(cx, ox+5, oy+3, 2, 6, 19);
    // dlaně
    rect(cx, ox-7, oy+9, 2, 2, 12);
    rect(cx, ox+5, oy+9, 2, 2, 12);
    // nohy - 2 framy
    if(frame === 0){
      rect(cx, ox-3, oy+14, 2, 4, 30);
      rect(cx, ox+1, oy+14, 2, 4, 30);
      rect(cx, ox-3, oy+18, 3, 2, 0);       // boty
      rect(cx, ox+1, oy+18, 3, 2, 0);
    } else {
      rect(cx, ox-3, oy+14, 2, 5, 30);
      rect(cx, ox+1, oy+13, 2, 5, 30);
      rect(cx, ox-3, oy+19, 3, 2, 0);
      rect(cx, ox+1, oy+18, 3, 2, 0);
    }
  } else if(dir === 'right'){
    // bok - užší
    fillEllipse(cx, ox-1, oy+5, 5, 7, 19);
    fillEllipse(cx, ox-1, oy+4, 4, 5, 20);
    rect(cx, ox-3, oy, 7, 4, 19);
    // ruka (vepředu)
    rect(cx, ox+2, oy+3, 2, 6, 19);
    rect(cx, ox+2, oy+9, 2, 2, 12);
    // kalhoty
    rect(cx, ox-3, oy+10, 7, 4, 30);
    // nohy
    if(frame === 0){
      rect(cx, ox-2, oy+14, 2, 4, 30);
      rect(cx, ox+1, oy+14, 2, 4, 30);
      rect(cx, ox-2, oy+18, 3, 2, 0);
      rect(cx, ox+1, oy+18, 3, 2, 0);
    } else {
      rect(cx, ox-2, oy+14, 2, 5, 30);
      rect(cx, ox+2, oy+14, 2, 4, 30);
      rect(cx, ox-2, oy+19, 3, 2, 0);
      rect(cx, ox+2, oy+18, 3, 2, 0);
    }
  }
}

function makeOwnerDown(frame){
  const { c, cx } = makeCanvas(24, 36);
  drawOwnerBody(cx, 12, 12, 'down', frame);
  drawOwnerHead(cx, 12, 8, 'down');
  return c;
}
function makeOwnerUp(frame){
  const { c, cx } = makeCanvas(24, 36);
  drawOwnerBody(cx, 12, 12, 'up', frame);
  drawOwnerHead(cx, 12, 8, 'up');
  return c;
}
function makeOwnerRight(frame){
  const { c, cx } = makeCanvas(24, 36);
  drawOwnerBody(cx, 12, 12, 'right', frame);
  drawOwnerHead(cx, 12, 8, 'right');
  return c;
}

export const OWNER_DOWN  = [makeOwnerDown(0), makeOwnerDown(1)];
export const OWNER_UP    = [makeOwnerUp(0), makeOwnerUp(1)];
export const OWNER_RIGHT = [makeOwnerRight(0), makeOwnerRight(1)];
export const OWNER_LEFT  = [flipH(OWNER_RIGHT[0]), flipH(OWNER_RIGHT[1])];

/* Vykřičník nad hlavou */
export const ALERT_SPR = (() => {
  const { c, cx } = makeCanvas(8, 16);
  rect(cx, 3, 0, 2, 9, 15);     // tmavá červená střed
  rect(cx, 3, 1, 2, 7, 16);     // červená
  px(cx, 3, 1, 17);             // růžový highlight
  rect(cx, 3, 11, 2, 2, 15);    // tečka
  return c;
})();

/* =========================================================
   PŘEDMĚTY — 18×18, vykreslené pixel art
   ========================================================= */

export const ITEM_PIZZA = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // klín pizzy
  fillCircle(cx, 9, 11, 7, 12);             // korpus krémový
  fillCircle(cx, 9, 11, 6, 20);             // sýr
  // okraj
  for(let i=0;i<360;i+=20){
    const rad = i*Math.PI/180;
    px(cx, 9+Math.round(7*Math.cos(rad)), 11+Math.round(7*Math.sin(rad)), 11);
  }
  // saláma (červené tečky)
  rect(cx, 5, 8, 2, 2, 15);
  rect(cx, 11, 7, 2, 2, 15);
  rect(cx, 7, 13, 2, 2, 15);
  rect(cx, 12, 12, 2, 2, 15);
  px(cx, 9, 10, 16);
  return c;
})();

export const ITEM_SAUSAGE = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // párek (oranžovo-červený)
  fillEllipse(cx, 9, 9, 7, 3, 11);          // tmavý okraj
  fillEllipse(cx, 9, 9, 6, 2, 16);          // červená
  fillEllipse(cx, 9, 8, 5, 1, 17);          // highlight
  // konce (tmavší)
  px(cx, 2, 9, 11);
  px(cx, 16, 9, 11);
  return c;
})();

export const ITEM_COOKIE = (() => {
  const { c, cx } = makeCanvas(18, 18);
  fillCircle(cx, 9, 9, 7, 22);              // tmavé těsto okraj
  fillCircle(cx, 9, 9, 6, 23);              // střední
  fillEllipse(cx, 8, 7, 4, 3, 24);          // highlight
  // čokoládové kousky
  rect(cx, 5, 7, 2, 2, 11);
  rect(cx, 11, 6, 2, 2, 11);
  rect(cx, 7, 11, 2, 2, 11);
  rect(cx, 11, 11, 2, 2, 11);
  px(cx, 9, 9, 11);
  return c;
})();

export const ITEM_APPLE = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // jablko
  fillCircle(cx, 9, 11, 6, 15);
  fillCircle(cx, 9, 11, 5, 16);
  fillEllipse(cx, 7, 9, 2, 2, 17);          // highlight
  // stopka
  rect(cx, 9, 4, 1, 3, 22);
  // lístek
  fillEllipse(cx, 11, 5, 2, 1, 27);
  return c;
})();

export const ITEM_BREAD = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // rohlík (oblouk)
  fillEllipse(cx, 9, 10, 7, 4, 22);         // tmavá kůrka
  fillEllipse(cx, 9, 9, 6, 3, 24);          // střední
  fillEllipse(cx, 9, 8, 5, 2, 25);          // light
  // pruhy přes
  px(cx, 5, 9, 22);
  px(cx, 8, 8, 22);
  px(cx, 11, 8, 22);
  px(cx, 14, 9, 22);
  return c;
})();

export const ITEM_SOCK = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // ponožka - obdélníková s patou
  rect(cx, 5, 4, 8, 7, 31);                 // modrá noha
  rect(cx, 5, 11, 8, 4, 30);                // pata
  rect(cx, 13, 11, 2, 4, 30);               // pata bok
  // pruhy
  hline(cx, 5, 5, 8, 6);
  hline(cx, 5, 7, 8, 6);
  // okraj nahoře
  hline(cx, 5, 4, 8, 0);
  return c;
})();

export const ITEM_SLIPPER = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // bačkora - oválný spodek + pásek
  fillEllipse(cx, 9, 12, 8, 3, 16);         // podrážka
  fillEllipse(cx, 9, 11, 7, 2, 17);
  // pásek přes
  rect(cx, 4, 7, 11, 4, 15);
  rect(cx, 4, 7, 11, 1, 16);                // top highlight
  // chlupatý okraj
  px(cx, 3, 9, 6);
  px(cx, 14, 9, 6);
  return c;
})();

export const ITEM_TP = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // toaleťák - válec + odvíjející se kus
  fillEllipse(cx, 9, 8, 5, 4, 6);           // válec
  fillEllipse(cx, 9, 7, 4, 3, 7);
  px(cx, 9, 8, 8);                           // střed díra
  // konec toaleťáku visí dolů
  rect(cx, 9, 11, 3, 6, 6);
  rect(cx, 9, 11, 3, 1, 8);
  return c;
})();

export const ITEM_REMOTE = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // dálkový ovladač - vertikální obdélník s tlačítky
  rect(cx, 5, 3, 8, 13, 1);                 // tělo
  rect(cx, 6, 4, 6, 11, 2);                 // displej
  // tlačítka (světle barevné)
  px(cx, 7, 6, 19);                          // žluté
  px(cx, 9, 6, 16);                          // červené
  px(cx, 11, 6, 27);                         // zelené
  rect(cx, 7, 9, 5, 1, 9);                   // šedý pruh
  rect(cx, 7, 11, 2, 1, 9);
  rect(cx, 10, 11, 2, 1, 9);
  return c;
})();

export const ITEM_FLOWER = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // květina v květináči
  rect(cx, 5, 12, 8, 4, 22);                // květináč hnědý
  rect(cx, 4, 12, 10, 1, 23);
  // stonek
  rect(cx, 9, 7, 1, 5, 26);
  // květ
  px(cx, 8, 6, 18);                          // růžová
  px(cx, 9, 5, 17);
  px(cx, 10, 6, 18);
  px(cx, 9, 7, 19);                          // žlutý střed
  px(cx, 8, 7, 18);
  px(cx, 10, 7, 18);
  // listy
  px(cx, 7, 9, 27);
  px(cx, 11, 10, 27);
  return c;
})();

export const ITEM_PENCIL = (() => {
  const { c, cx } = makeCanvas(18, 18);
  // tužka diagonálně
  for(let i=0;i<10;i++){
    px(cx, 4+i, 13-i, 19);                   // žluté tělo
    px(cx, 5+i, 13-i, 20);                   // tmavší
  }
  // hrot
  px(cx, 14, 4, 12);                         // dřevo
  px(cx, 15, 4, 0);                          // tuha
  // guma
  rect(cx, 3, 13, 2, 2, 16);
  return c;
})();

/* =========================================================
   ITEM LISTY (pro game logiku)
   ========================================================= */
export const FOOD_LIST = [
  { spr: ITEM_PIZZA,   pts: 30, name: 'pizza' },
  { spr: ITEM_SAUSAGE, pts: 25, name: 'párek' },
  { spr: ITEM_COOKIE,  pts: 20, name: 'sušenka' },
  { spr: ITEM_APPLE,   pts: 10, name: 'jablko' },
  { spr: ITEM_BREAD,   pts: 15, name: 'rohlík' },
];

export const TRASH_LIST = [
  { spr: ITEM_SOCK,    pts: 5, name: 'ponožka',   tummy: 12 },
  { spr: ITEM_SLIPPER, pts: 5, name: 'papuče',    tummy: 14 },
  { spr: ITEM_TP,      pts: 5, name: 'toaleťák',  tummy: 10 },
  { spr: ITEM_REMOTE,  pts: 5, name: 'dálkák',    tummy: 16 },
  { spr: ITEM_FLOWER,  pts: 5, name: 'kytka',     tummy: 13 },
  { spr: ITEM_PENCIL,  pts: 5, name: 'tužka',     tummy: 11 },
];
