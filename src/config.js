/* =========================================================
   CONFIG — canvas, kontext, rozměry
   ========================================================= */

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

export const W = canvas.width;        // 320
export const H = canvas.height;       // 240
export const TILE = 16;
export const HUD_H = 32;
export const ROOM_TW = 20;            // tiles wide (320/16)
export const ROOM_TH = 13;            // tiles tall ((240-32)/16 = 13)
export const ROOM_W = ROOM_TW * TILE; // 320
export const ROOM_H = ROOM_TH * TILE; // 208
