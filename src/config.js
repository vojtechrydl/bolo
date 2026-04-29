/* =========================================================
   CONFIG — canvas, kontext, rozměry
   Logický canvas 480×360 (1.5× původních 320×240).
   HUD je teď HTML overlay, takže canvas obsahuje jen herní svět.
   ========================================================= */

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

export const W = canvas.width;        // 480
export const H = canvas.height;       // 360
export const TILE = 24;
export const HUD_H = 0;               // HUD je HTML overlay
export const ROOM_TW = 20;            // 480/24
export const ROOM_TH = 15;            // 360/24
export const ROOM_W = ROOM_TW * TILE; // 480
export const ROOM_H = ROOM_TH * TILE; // 360
