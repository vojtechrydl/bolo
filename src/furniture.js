/* =========================================================
   NÁBYTEK — programaticky kreslený do off-screen kanvasů
   ========================================================= */

import { PAL } from './palette.js';

/* =========================================================
   NÁBYTEK — větší sprity (ručně malované)
   ========================================================= */

/* GAUČ (4 tiles wide × 2 tall = 64×32) */
function buildSofa(){
  const w = 64, h = 32;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const cx = c.getContext('2d');
  // back
  cx.fillStyle = PAL[7]; cx.fillRect(2, 2, w-4, 12);
  cx.fillStyle = PAL[8]; cx.fillRect(2, 4, w-4, 8);
  // arms
  cx.fillStyle = PAL[7]; cx.fillRect(0, 8, 4, 20);
  cx.fillRect(w-4, 8, 4, 20);
  // seat
  cx.fillStyle = PAL[8]; cx.fillRect(4, 14, w-8, 12);
  // cushion lines
  cx.fillStyle = PAL[7]; cx.fillRect(w/2-1, 14, 2, 12);
  cx.fillStyle = PAL[7]; cx.fillRect(w/4-1, 14, 2, 12);
  cx.fillRect(3*w/4-1, 14, 2, 12);
  // bottom shadow
  cx.fillStyle = PAL[1]; cx.fillRect(0, 28, w, 4);
  // dark outline
  cx.fillStyle = PAL[0];
  cx.fillRect(0,2,1,h-2); cx.fillRect(w-1,2,1,h-2);
  cx.fillRect(0,1,w,1);
  return c;
}
export const SOFA_CANVAS = buildSofa();

/* STŮL (3 tiles × 2 tiles = 48×32) */
function buildTable(){
  const w=48, h=32;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  // top
  cx.fillStyle=PAL[3]; cx.fillRect(0, 4, w, 12);
  cx.fillStyle=PAL[4]; cx.fillRect(0, 4, w, 4);
  cx.fillStyle=PAL[2]; cx.fillRect(0,14,w,2);
  // legs
  cx.fillStyle=PAL[2];
  cx.fillRect(2, 16, 4, 14);
  cx.fillRect(w-6, 16, 4, 14);
  // table outline
  cx.fillStyle=PAL[1];
  cx.fillRect(0,4,1,12); cx.fillRect(w-1,4,1,12);
  cx.fillRect(0,3,w,1);
  return c;
}
export const TABLE_CANVAS = buildTable();

/* POSTEL (3 tiles × 4 tiles = 48×64) */
function buildBed(){
  const w=48, h=64;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  // headboard
  cx.fillStyle=PAL[2]; cx.fillRect(0, 0, w, 8);
  cx.fillStyle=PAL[3]; cx.fillRect(2, 1, w-4, 5);
  // mattress
  cx.fillStyle=PAL[6]; cx.fillRect(2, 8, w-4, h-14);
  // blanket
  cx.fillStyle=PAL[14]; cx.fillRect(2, 28, w-4, h-34);
  cx.fillStyle=PAL[6]; cx.fillRect(2, 28, w-4, 4); // sheet at top
  // pillow
  cx.fillStyle=PAL[6]; cx.fillRect(6, 10, w-12, 12);
  cx.fillStyle=PAL[5]; cx.fillRect(8, 12, w-16, 8);
  // base
  cx.fillStyle=PAL[2]; cx.fillRect(0, h-6, w, 6);
  // outline
  cx.fillStyle=PAL[0];
  cx.fillRect(0,0,1,h); cx.fillRect(w-1,0,1,h);
  return c;
}
export const BED_CANVAS = buildBed();

/* LEDNICE (2×3 = 32×48) */
function buildFridge(){
  const w=32, h=48;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  cx.fillStyle=PAL[6]; cx.fillRect(0,0,w,h);
  cx.fillStyle=PAL[5]; cx.fillRect(2,2,w-4,h-4);
  cx.fillStyle=PAL[15]; cx.fillRect(0,18,w,2);  // door split
  cx.fillStyle=PAL[15]; cx.fillRect(w-6, 8, 2, 6);  // top handle
  cx.fillRect(w-6, 24, 2, 8);  // bottom handle
  cx.fillStyle=PAL[0];
  cx.fillRect(0,0,w,1); cx.fillRect(0,h-1,w,1);
  cx.fillRect(0,0,1,h); cx.fillRect(w-1,0,1,h);
  return c;
}
export const FRIDGE_CANVAS = buildFridge();

/* SPORÁK (2×2 = 32×32) */
function buildStove(){
  const w=32, h=32;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  cx.fillStyle=PAL[15]; cx.fillRect(0,0,w,h);
  cx.fillStyle=PAL[0];  cx.fillRect(2,2,w-4,8);
  cx.fillStyle=PAL[7];  cx.fillRect(4,4,4,4);
  cx.fillStyle=PAL[12]; cx.fillRect(5,5,2,2);
  // burners
  cx.fillStyle=PAL[0];
  cx.fillRect(4,14,8,8); cx.fillRect(w-12,14,8,8);
  cx.fillStyle=PAL[15];
  cx.fillRect(6,16,4,4); cx.fillRect(w-10,16,4,4);
  cx.fillStyle=PAL[0];
  cx.fillRect(4,24,4,2); cx.fillRect(w-8,24,4,2);
  cx.fillStyle=PAL[0];
  cx.fillRect(0,0,w,1); cx.fillRect(0,h-1,w,1);
  cx.fillRect(0,0,1,h); cx.fillRect(w-1,0,1,h);
  return c;
}
export const STOVE_CANVAS = buildStove();

/* TV (2×2 = 32×32) */
function buildTV(){
  const w=32, h=32;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  // stand
  cx.fillStyle=PAL[2]; cx.fillRect(8, 26, 16, 4);
  cx.fillRect(12, 24, 8, 4);
  // body
  cx.fillStyle=PAL[0]; cx.fillRect(0, 2, w, 22);
  // screen
  cx.fillStyle=PAL[14]; cx.fillRect(2, 4, w-4, 16);
  // static lines
  cx.fillStyle=PAL[6]; cx.fillRect(4, 6, 4, 1);
  cx.fillStyle=PAL[5]; cx.fillRect(10, 9, 8, 1);
  cx.fillStyle=PAL[6]; cx.fillRect(20, 12, 6, 1);
  return c;
}
export const TV_CANVAS = buildTV();

/* STROM (2×3 = 32×48) */
function buildTree(){
  const w=32, h=48;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  // trunk
  cx.fillStyle=PAL[2]; cx.fillRect(13, 24, 6, 24);
  cx.fillStyle=PAL[1]; cx.fillRect(13, 24, 1, 24);
  cx.fillStyle=PAL[3]; cx.fillRect(18, 24, 1, 24);
  // foliage layers
  cx.fillStyle=PAL[10];
  cx.fillRect(6,4,20,18);
  cx.fillRect(4,8,24,12);
  cx.fillRect(2,12,28,8);
  cx.fillStyle=PAL[11];
  cx.fillRect(8,6,16,12);
  cx.fillRect(6,10,18,8);
  cx.fillStyle=PAL[10];
  cx.fillRect(10, 4, 4, 4);
  cx.fillRect(20, 6, 3, 3);
  return c;
}
export const TREE_CANVAS = buildTree();

/* KEŘ */
function buildBush(){
  const w=24, h=20;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  cx.fillStyle=PAL[10];
  cx.fillRect(2, 6, 20, 12);
  cx.fillRect(0, 10, 24, 6);
  cx.fillStyle=PAL[11];
  cx.fillRect(4, 4, 8, 6);
  cx.fillRect(12, 6, 8, 6);
  cx.fillStyle=PAL[10];
  cx.fillRect(7, 2, 4, 4);
  return c;
}
export const BUSH_CANVAS = buildBush();

/* MISKA (jen pro dekoraci v kuchyni) */
function buildBowl(){
  const w=20, h=10;
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cx=c.getContext('2d');
  cx.fillStyle=PAL[7];  cx.fillRect(0, 4, w, 4);
  cx.fillStyle=PAL[8];  cx.fillRect(0, 4, w, 2);
  cx.fillStyle=PAL[1];  cx.fillRect(2, 2, w-4, 3);
  cx.fillStyle=PAL[3];  cx.fillRect(3, 2, w-6, 2);
  return c;
}
export const BOWL_CANVAS = buildBowl();

/* Lookup nábytek-canvas podle typu z definice místnosti.
   'counter' nemá canvas — vykresluje se jako obdélník v render.js */
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
    case 'counter': return null;
  }
  return null;
}
