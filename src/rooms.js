/* =========================================================
   ROOMS — 4 místnosti, 20×13 tiles, propojené dveřmi
   Pre-rendered pozadí pro každou místnost (podlaha, stěny, dveře)
   ========================================================= */

import { PAL } from './palette.js';
import { TILE, ROOM_TW, ROOM_TH, ROOM_W, ROOM_H } from './config.js';
import {
  SOFA_CANVAS, TABLE_CANVAS, BED_CANVAS, FRIDGE_CANVAS,
  STOVE_CANVAS, TV_CANVAS, TREE_CANVAS, BUSH_CANVAS, BOWL_CANVAS
} from './furniture.js';

/* =========================================================
   ROOMS — 4 místnosti, 20x13 tiles každá
   F = floor, # = wall, _ = doorway (passable, na okraji)
   Furniture posíláme zvlášť jako objekty (s hideable flagem)
   ========================================================= */

export const ROOM_KITCHEN = {
  id: 'kitchen',
  name: 'Kuchyň',
  floor: 'tile',  // styly podlah dole
  furniture: [
    // counters along top
    { type: 'fridge',  px: 16,  py: 16, w: 32, h: 48, hide: false },
    { type: 'stove',   px: 64,  py: 16, w: 32, h: 32, hide: false },
    { type: 'counter', px: 96,  py: 16, w: 96, h: 24, hide: false },
    { type: 'table',   px: 144, py: 96, w: 48, h: 32, hide: true  },
    { type: 'bowl',    px: 226, py: 152, w: 20, h: 10, hide: false },
  ],
  doors: {
    east:  { range: [3, 6],  target: 'living',  side: 'west'  },
    south: { range: [9, 12], target: 'bedroom', side: 'north' },
  },
};

export const ROOM_LIVING = {
  id: 'living',
  name: 'Obývák',
  floor: 'wood',
  furniture: [
    { type: 'sofa',   px: 32,  py: 144, w: 64, h: 32, hide: true  },
    { type: 'tv',     px: 144, py: 24,  w: 32, h: 32, hide: false },
    { type: 'table',  px: 196, py: 116, w: 48, h: 32, hide: true  },
    { type: 'bush',   px: 250, py: 36,  w: 24, h: 20, hide: false }, // pokojovka
  ],
  doors: {
    west:  { range: [3, 6],  target: 'kitchen', side: 'east'  },
    south: { range: [9, 12], target: 'garden',  side: 'north' },
  },
};

export const ROOM_BEDROOM = {
  id: 'bedroom',
  name: 'Ložnice',
  floor: 'carpet',
  furniture: [
    { type: 'bed',    px: 32, py: 32, w: 48, h: 64, hide: true },
    { type: 'table',  px: 220, py: 60, w: 48, h: 32, hide: true },
    { type: 'bush',   px: 260, py: 140, w: 24, h: 20, hide: false },
  ],
  doors: {
    north: { range: [3, 6],  target: 'kitchen', side: 'south' },
    east:  { range: [9, 12], target: 'garden',  side: 'west'  },
  },
};

export const ROOM_GARDEN = {
  id: 'garden',
  name: 'Zahrada',
  floor: 'grass',
  furniture: [
    { type: 'tree',   px: 32, py: 24,  w: 32, h: 48, hide: false },
    { type: 'bush',   px: 90, py: 50,  w: 24, h: 20, hide: false },
    { type: 'tree',   px: 240, py: 130, w: 32, h: 48, hide: false },
    { type: 'bush',   px: 200, py: 40,  w: 24, h: 20, hide: false },
    { type: 'bush',   px: 160, py: 160, w: 24, h: 20, hide: true },
  ],
  doors: {
    north: { range: [3, 6],  target: 'living',  side: 'south' },
    west:  { range: [9, 12], target: 'bedroom', side: 'east'  },
  },
};

export const ROOMS = {
  kitchen: ROOM_KITCHEN,
  living:  ROOM_LIVING,
  bedroom: ROOM_BEDROOM,
  garden:  ROOM_GARDEN,
};

/* Předpočítáme pre-rendered pozadí každé místnosti */
export const ROOM_BG = {};
export function buildRoomBg(room){
  const c = document.createElement('canvas');
  c.width = ROOM_W; c.height = ROOM_H;
  const cx = c.getContext('2d');

  // Podlaha
  if(room.floor === 'tile'){
    // šachovnicová dlažba
    for(let y=0; y<ROOM_TH; y++){
      for(let x=0; x<ROOM_TW; x++){
        cx.fillStyle = ((x+y)%2===0) ? PAL[5] : PAL[6];
        cx.fillRect(x*TILE, y*TILE, TILE, TILE);
        cx.fillStyle = PAL[15];
        cx.fillRect(x*TILE, y*TILE, TILE, 1);
        cx.fillRect(x*TILE, y*TILE, 1, TILE);
      }
    }
  } else if(room.floor === 'wood'){
    // prkna dřevěné podlahy
    for(let y=0; y<ROOM_H; y+=8){
      for(let x=0; x<ROOM_W; x+=64){
        const off = (Math.floor(y/8)%2)*32;
        cx.fillStyle = ((Math.floor(y/8)+Math.floor(x/64))%2===0) ? PAL[3] : PAL[4];
        cx.fillRect(x+off, y, 64, 8);
      }
    }
    // tmavé linky mezi prkny
    cx.fillStyle = PAL[2];
    for(let y=8; y<ROOM_H; y+=8) cx.fillRect(0, y, ROOM_W, 1);
    for(let y=0; y<ROOM_H; y+=8){
      for(let x = (Math.floor(y/8)%2)*32; x<ROOM_W; x+=64){
        cx.fillRect(x, y, 1, 8);
      }
    }
  } else if(room.floor === 'carpet'){
    // koberec
    cx.fillStyle = PAL[7];
    cx.fillRect(0, 0, ROOM_W, ROOM_H);
    cx.fillStyle = PAL[8];
    for(let y=0; y<ROOM_H; y+=4){
      for(let x=(y%8===0?0:2); x<ROOM_W; x+=4){
        cx.fillRect(x, y, 1, 1);
      }
    }
    cx.fillStyle = PAL[1];
    for(let y=0; y<ROOM_H; y+=16){
      for(let x=4; x<ROOM_W; x+=16){
        cx.fillRect(x, y, 1, 1);
      }
    }
  } else if(room.floor === 'grass'){
    cx.fillStyle = PAL[10];
    cx.fillRect(0, 0, ROOM_W, ROOM_H);
    // travnaté chumáče
    cx.fillStyle = PAL[11];
    for(let i=0;i<200;i++){
      const x = (i*37 % ROOM_W);
      const y = (i*53 % ROOM_H);
      cx.fillRect(x, y, 1, 2);
    }
    cx.fillStyle = PAL[9];
    for(let i=0;i<60;i++){
      const x = (i*71 % ROOM_W);
      const y = (i*97 % ROOM_H);
      cx.fillRect(x, y, 2, 1);
    }
    // cestička
    cx.fillStyle = PAL[4];
    cx.fillRect(0, 100, ROOM_W, 16);
    cx.fillStyle = PAL[3];
    for(let x=2; x<ROOM_W; x+=8){
      cx.fillRect(x, 102, 4, 2);
      cx.fillRect(x+2, 110, 4, 2);
    }
  }

  // Stěny + dveře (pokud místnost není zahrada)
  if(room.floor !== 'grass'){
    cx.fillStyle = PAL[2];
    cx.fillRect(0, 0, ROOM_W, TILE);                // top
    cx.fillRect(0, ROOM_H-TILE, ROOM_W, TILE);      // bottom
    cx.fillRect(0, 0, TILE, ROOM_H);                // left
    cx.fillRect(ROOM_W-TILE, 0, TILE, ROOM_H);      // right
    cx.fillStyle = PAL[1];
    cx.fillRect(0, TILE-2, ROOM_W, 2);
    cx.fillRect(0, ROOM_H-TILE, ROOM_W, 2);
    cx.fillRect(TILE-2, 0, 2, ROOM_H);
    cx.fillRect(ROOM_W-TILE, 0, 2, ROOM_H);
    // tapeta na zdi (horní)
    cx.fillStyle = PAL[5];
    for(let x=4; x<ROOM_W; x+=8) cx.fillRect(x, 4, 2, 2);
  } else {
    // plot kolem zahrady
    cx.fillStyle = PAL[3];
    cx.fillRect(0, 0, ROOM_W, 6);
    cx.fillRect(0, ROOM_H-8, ROOM_W, 8);
    cx.fillRect(0, 0, 6, ROOM_H);
    cx.fillRect(ROOM_W-6, 0, 6, ROOM_H);
    cx.fillStyle = PAL[2];
    for(let x=0;x<ROOM_W;x+=8){
      cx.fillRect(x, 0, 2, ROOM_H);
    }
    for(let x=0;x<ROOM_W;x+=8){
      cx.fillRect(x, ROOM_H-8, 2, 8);
    }
  }

  // Dveře — průchody
  for(const dir in room.doors){
    const d = room.doors[dir];
    const t1 = d.range[0]*TILE;
    const t2 = (d.range[1]+1)*TILE;
    if(dir === 'east'){
      cx.fillStyle = PAL[1];
      cx.fillRect(ROOM_W-TILE, t1, TILE, t2-t1);
      cx.fillStyle = PAL[3];
      cx.fillRect(ROOM_W-TILE+2, t1+2, TILE-2, t2-t1-4);
      // doorknob
      cx.fillStyle = PAL[12]; cx.fillRect(ROOM_W-6, t1+(t2-t1)/2-1, 2, 2);
    } else if(dir === 'west'){
      cx.fillStyle = PAL[1];
      cx.fillRect(0, t1, TILE, t2-t1);
      cx.fillStyle = PAL[3];
      cx.fillRect(0, t1+2, TILE-2, t2-t1-4);
      cx.fillStyle = PAL[12]; cx.fillRect(4, t1+(t2-t1)/2-1, 2, 2);
    } else if(dir === 'south'){
      cx.fillStyle = PAL[1];
      cx.fillRect(t1, ROOM_H-TILE, t2-t1, TILE);
      cx.fillStyle = PAL[3];
      cx.fillRect(t1+2, ROOM_H-TILE+2, t2-t1-4, TILE-2);
    } else if(dir === 'north'){
      cx.fillStyle = PAL[1];
      cx.fillRect(t1, 0, t2-t1, TILE);
      cx.fillStyle = PAL[3];
      cx.fillRect(t1+2, 2, t2-t1-4, TILE-2);
    }
  }

  // KITCHEN — dlaždice na stěně nad sporákem
  if(room.id === 'kitchen'){
    cx.fillStyle = PAL[6];
    cx.fillRect(64, 8, 128, 6);
    cx.fillStyle = PAL[14];
    for(let x=66;x<192;x+=4){
      cx.fillRect(x, 10, 2, 2);
    }
  }
  // LIVING — obraz na zdi
  if(room.id === 'living'){
    cx.fillStyle = PAL[12];
    cx.fillRect(60, 4, 32, 10);
    cx.fillStyle = PAL[10];
    cx.fillRect(62, 6, 28, 6);
    cx.fillStyle = PAL[14];
    cx.fillRect(64, 8, 8, 4);
  }
  // BEDROOM — okno
  if(room.id === 'bedroom'){
    cx.fillStyle = PAL[14];
    cx.fillRect(140, 2, 36, 12);
    cx.fillStyle = PAL[6];
    cx.fillRect(140, 8, 36, 1);
    cx.fillRect(157, 2, 1, 12);
    cx.fillStyle = PAL[3];
    cx.fillRect(138, 0, 40, 2);
    cx.fillRect(138, 14, 40, 2);
  }

  return c;
}

/* Pre-buildne pozadí všech místností do ROOM_BG */
export function buildAllBackgrounds(){
  for(const id in ROOMS){
    ROOM_BG[id] = buildRoomBg(ROOMS[id]);
  }
}
