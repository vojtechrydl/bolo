/* =========================================================
   ROOMS — 4 místnosti, 20×15 tiles (480×360), propojené dveřmi
   Pre-rendered pozadí s víc detaily.
   ========================================================= */

import { PAL } from './palette.js';
import { TILE, ROOM_TW, ROOM_TH, ROOM_W, ROOM_H } from './config.js';
import { makeCanvas, rect, px, hline, vline, fillEllipse } from './primitives.js';

/* Doors používají range v tiles. 20×15 grid, takže middle ranges:
   - horizontal door (east/west): tiles 6-9 (4 tiles wide)
   - vertical door (north/south): tiles 8-11
*/

export const ROOM_KITCHEN = {
  id: 'kitchen',
  name: 'Kuchyň',
  floor: 'tile',
  furniture: [
    { type: 'fridge',  px: 24,  py: 24,  w: 48, h: 72, hide: false },
    { type: 'stove',   px: 96,  py: 24,  w: 48, h: 48, hide: false },
    { type: 'counter', px: 168, py: 24,  w: 144, h: 36, hide: false },
    { type: 'table',   px: 216, py: 168, w: 72, h: 48, hide: true  },
    { type: 'bowl',    px: 360, py: 240, w: 30, h: 16, hide: false },
  ],
  doors: {
    east:  { range: [6, 9],  target: 'living',  side: 'west'  },
    south: { range: [8, 11], target: 'bedroom', side: 'north' },
  },
};

export const ROOM_LIVING = {
  id: 'living',
  name: 'Obývák',
  floor: 'wood',
  furniture: [
    { type: 'sofa',   px: 48,  py: 240, w: 96, h: 48, hide: true  },
    { type: 'tv',     px: 216, py: 36,  w: 48, h: 48, hide: false },
    { type: 'table',  px: 300, py: 192, w: 72, h: 48, hide: true  },
    { type: 'bush',   px: 396, py: 48,  w: 36, h: 30, hide: false },
  ],
  doors: {
    west:  { range: [6, 9],  target: 'kitchen', side: 'east'  },
    south: { range: [8, 11], target: 'garden',  side: 'north' },
  },
};

export const ROOM_BEDROOM = {
  id: 'bedroom',
  name: 'Ložnice',
  floor: 'carpet',
  furniture: [
    { type: 'bed',    px: 48,  py: 48,  w: 72, h: 96, hide: true  },
    { type: 'table',  px: 336, py: 96,  w: 72, h: 48, hide: true  },
    { type: 'bush',   px: 396, py: 240, w: 36, h: 30, hide: false },
  ],
  doors: {
    north: { range: [8, 11], target: 'kitchen', side: 'south' },
    east:  { range: [6, 9],  target: 'garden',  side: 'west'  },
  },
};

export const ROOM_GARDEN = {
  id: 'garden',
  name: 'Zahrada',
  floor: 'grass',
  furniture: [
    { type: 'tree',   px: 48,  py: 36,  w: 48, h: 72, hide: false },
    { type: 'bush',   px: 144, py: 84,  w: 36, h: 30, hide: false },
    { type: 'tree',   px: 384, py: 204, w: 48, h: 72, hide: false },
    { type: 'bush',   px: 312, py: 60,  w: 36, h: 30, hide: false },
    { type: 'bush',   px: 240, py: 264, w: 36, h: 30, hide: true  },
  ],
  doors: {
    north: { range: [8, 11], target: 'living',  side: 'south' },
    west:  { range: [6, 9],  target: 'bedroom', side: 'east'  },
  },
};

export const ROOMS = {
  kitchen: ROOM_KITCHEN,
  living:  ROOM_LIVING,
  bedroom: ROOM_BEDROOM,
  garden:  ROOM_GARDEN,
};

export const ROOM_BG = {};

/* =========================================================
   POZADÍ — pre-rendered pro každou místnost
   ========================================================= */

function drawTileFloor(cx){
  // dlažba - šachovnice
  for(let ty=0; ty<ROOM_TH; ty++){
    for(let tx=0; tx<ROOM_TW; tx++){
      const lighter = (tx + ty) % 2 === 0;
      const baseColor = lighter ? 8 : 9;     // 8=lt gray, 9=mid gray
      rect(cx, tx*TILE, ty*TILE, TILE, TILE, baseColor);
      // grout lines (tmavší)
      hline(cx, tx*TILE, ty*TILE, TILE, 10);
      vline(cx, tx*TILE, ty*TILE, TILE, 10);
      // highlight v rohu pro 3D efekt
      hline(cx, tx*TILE+1, ty*TILE+1, TILE-2, lighter ? 7 : 8);
      vline(cx, tx*TILE+1, ty*TILE+1, 1, lighter ? 7 : 8);
    }
  }
}

function drawWoodFloor(cx){
  // dřevěná podlaha - vodorovná prkna
  for(let ty=0; ty<ROOM_TH; ty++){
    const row = Math.floor(ty / 2);
    const offset = (row % 2) * (TILE * 2);
    rect(cx, 0, ty*TILE, ROOM_W, TILE, 23);                        // base
    if(ty % 2 === 0){
      rect(cx, 0, ty*TILE, ROOM_W, 2, 24);                          // top hi
      hline(cx, 0, ty*TILE+TILE-1, ROOM_W, 22);                     // bottom shadow
    }
    // prkna - vertikální mezery
    for(let x=0; x<ROOM_W; x+=TILE*2){
      vline(cx, ((x + offset) % ROOM_W), ty*TILE, TILE, 22);
    }
    // dřevěná struktura - random tečky
    if(ty % 3 === 0){
      for(let i=0;i<5;i++){
        px(cx, (ty*47 + i*89) % ROOM_W, ty*TILE + 4 + (i%3)*4, 22);
      }
    }
  }
}

function drawCarpetFloor(cx){
  // koberec - růžovo-krémový s vzorem
  rect(cx, 0, 0, ROOM_W, ROOM_H, 18);         // light pink base
  // vzor - diamanty
  for(let ty=0; ty<ROOM_TH; ty+=2){
    for(let tx=0; tx<ROOM_TW; tx+=2){
      const cx0 = tx*TILE + TILE;
      const cy0 = ty*TILE + TILE;
      px(cx, cx0,   cy0-2, 17);
      px(cx, cx0-1, cy0-1, 17);
      px(cx, cx0+1, cy0-1, 17);
      px(cx, cx0-2, cy0,   17);
      px(cx, cx0+2, cy0,   17);
      px(cx, cx0-1, cy0+1, 17);
      px(cx, cx0+1, cy0+1, 17);
      px(cx, cx0,   cy0+2, 17);
      px(cx, cx0,   cy0,   16);                // střed tmavší
    }
  }
  // okraj koberce
  rect(cx, 0, 0, ROOM_W, 4, 16);
  rect(cx, 0, ROOM_H-4, ROOM_W, 4, 16);
  rect(cx, 0, 0, 4, ROOM_H, 16);
  rect(cx, ROOM_W-4, 0, 4, ROOM_H, 16);
}

function drawGrassFloor(cx){
  // tráva - zelená s textury
  rect(cx, 0, 0, ROOM_W, ROOM_H, 27);          // střední zelená base
  // pruhy posekané trávy
  for(let ty=0; ty<ROOM_TH; ty++){
    if(ty % 2 === 0){
      hline(cx, 0, ty*TILE, ROOM_W, 28);       // světlejší pruh
    }
  }
  // tečky trávy / květin
  for(let i=0;i<200;i++){
    const x = (i*73 + 17) % ROOM_W;
    const y = (i*41 + 3) % ROOM_H;
    const c = i % 7 === 0 ? 19 : (i % 11 === 0 ? 17 : 28);
    px(cx, x, y, c);
  }
  // cestička z dlažebních kostek
  for(let i=0;i<3;i++){
    const x = ROOM_W/2 - 16 + (i%2)*32;
    const y = ROOM_H - 30 - i*30;
    fillEllipse(cx, x, y, 8, 4, 8);
    fillEllipse(cx, x, y-1, 7, 3, 7);
  }
}

function drawWalls(cx, room){
  // stěny - obvodové, kromě dveří
  // Top wall
  rect(cx, 0, 0, ROOM_W, 6, 22);
  rect(cx, 0, 0, ROOM_W, 2, 24);
  // Bot wall
  rect(cx, 0, ROOM_H-6, ROOM_W, 6, 22);
  rect(cx, 0, ROOM_H-2, ROOM_W, 2, 0);
  // Left wall
  rect(cx, 0, 0, 6, ROOM_H, 22);
  rect(cx, 0, 0, 2, ROOM_H, 24);
  // Right wall
  rect(cx, ROOM_W-6, 0, 6, ROOM_H, 22);
  rect(cx, ROOM_W-2, 0, 2, ROOM_H, 0);

  // Otevřít dveře
  for(const [dir, d] of Object.entries(room.doors)){
    const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
    if(dir === 'east'){
      rect(cx, ROOM_W-6, t1, 6, t2-t1, 0);   // průchod
      // rám
      rect(cx, ROOM_W-6, t1-2, 6, 2, 25);
      rect(cx, ROOM_W-6, t2, 6, 2, 25);
    } else if(dir === 'west'){
      rect(cx, 0, t1, 6, t2-t1, 0);
      rect(cx, 0, t1-2, 6, 2, 25);
      rect(cx, 0, t2, 6, 2, 25);
    } else if(dir === 'south'){
      rect(cx, t1, ROOM_H-6, t2-t1, 6, 0);
      rect(cx, t1-2, ROOM_H-6, 2, 6, 25);
      rect(cx, t2, ROOM_H-6, 2, 6, 25);
    } else if(dir === 'north'){
      rect(cx, t1, 0, t2-t1, 6, 0);
      rect(cx, t1-2, 0, 2, 6, 25);
      rect(cx, t2, 0, 2, 6, 25);
    }
  }
}

function drawCounter(cx, f){
  // kuchyňská linka - dřevěná deska + dřez
  rect(cx, f.px, f.py, f.w, f.h, 23);
  rect(cx, f.px, f.py, f.w, 4, 24);
  rect(cx, f.px, f.py+f.h-2, f.w, 2, 22);
  // dřez (vlevo vepředu)
  rect(cx, f.px+12, f.py+8, 24, 20, 6);
  rect(cx, f.px+13, f.py+9, 22, 18, 8);
  rect(cx, f.px+14, f.py+10, 20, 16, 9);
  // baterie
  rect(cx, f.px+22, f.py+4, 4, 6, 0);
  px(cx, f.px+24, f.py+10, 30);
}

function buildRoomBg(room){
  const { c, cx } = makeCanvas(ROOM_W, ROOM_H);
  switch(room.floor){
    case 'tile':   drawTileFloor(cx); break;
    case 'wood':   drawWoodFloor(cx); break;
    case 'carpet': drawCarpetFloor(cx); break;
    case 'grass':  drawGrassFloor(cx); break;
  }
  drawWalls(cx, room);

  // counter (kreslí se do BG, není to entita)
  for(const f of room.furniture){
    if(f.type === 'counter') drawCounter(cx, f);
  }

  return c;
}

export function buildAllBackgrounds(){
  for(const id in ROOMS){
    ROOM_BG[id] = buildRoomBg(ROOMS[id]);
  }
}
