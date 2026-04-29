/* =========================================================
   GAME — start/over, kolize, spawn, FX, pohyb hráče, AI paničky
   ========================================================= */

import { TILE, ROOM_W, ROOM_H } from './config.js';
import { STATE, game } from './state.js';
import { ROOMS } from './rooms.js';
import { FOOD_LIST, TRASH_LIST } from './sprites.js';
import { keys, pressedThisFrame } from './input.js';
import {
  snd_munch, snd_yum, snd_caught, snd_hide, snd_door,
  snd_gameover, snd_start
} from './audio.js';

/* Hráč hitbox: 16×18, vykreslený sprite je 24×24, ofset v render */
const PW = 16, PH = 18;
/* Owner hitbox: 12×16 */
const OW = 14, OH = 18;

/* =========================================================
   GAME FLOW
   ========================================================= */
export function startGame(){
  game.state = STATE.PLAYING;
  game.tick = 0;
  game.score = 0;
  game.tummy = 0;
  game.spawnTimer = 60;
  game.spawnInterval = 240;       // 4s @ 60fps
  game.gameTimer = 0;
  game.maxItems = 5;

  // Bezpečný spawn - střed kuchyně mezi linkou a stolem
  // Linka končí y=96, stůl začíná y=168 → mezera y=110-150
  game.player.x = 240;
  game.player.y = 130;
  game.player.dir = 'down';
  game.player.room = 'kitchen';
  game.player.hidden = false;
  game.player.hideSpot = null;
  game.player.frame = 0;
  game.player.frameTimer = 0;

  game.owner.x = 220;
  game.owner.y = 140;
  game.owner.dir = 'down';
  game.owner.room = pickRandomRoom('kitchen');
  game.owner.target = null;
  game.owner.waitTimer = 90;
  game.owner.angryTimer = 0;
  game.owner.frame = 0;
  game.owner.frameTimer = 0;

  game.items = [];
  game.fx = [];
  for(let i = 0; i < 3; i++) spawnItem();
  snd_start();
}

export function gameOver(){
  game.state = STATE.GAME_OVER;
  if(game.score > game.best){
    game.best = game.score;
    try { localStorage.setItem('boloEatsBest', String(game.best)); } catch(e){}
  }
  snd_gameover();
}

/* =========================================================
   KOLIZE
   ========================================================= */
export function rectsCollide(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

export function getBlockingFurniture(roomId){
  return ROOMS[roomId].furniture.filter(f =>
    f.type !== 'bowl' && f.type !== 'bush' && f.type !== 'counter'
  );
}

/* Vrací nábytek, do kterého naráží daný obdélník (x,y,w,h). */
export function isBlockedAt(x, y, roomId, w=PW, h=PH){
  const furn = getBlockingFurniture(roomId);
  for(const f of furn){
    // Hitbox nábytku - počítáme s lower portion (postavy můžou částečně překrývat top)
    const fx = f.px + 4;
    const fy = f.py + Math.floor(f.h * 0.4);
    const fw = f.w - 8;
    const fh = Math.ceil(f.h * 0.6);
    if(rectsCollide(x, y, w, h, fx, fy, fw, fh)) return f;
  }
  // counters - pevně blokují celé
  for(const f of ROOMS[roomId].furniture){
    if(f.type !== 'counter') continue;
    if(rectsCollide(x, y, w, h, f.px, f.py, f.w, f.h)) return f;
  }
  return null;
}

export function findHideSpot(playerX, playerY, roomId){
  const room = ROOMS[roomId];
  for(const f of room.furniture){
    if(!f.hide) continue;
    const cx = f.px + f.w/2, cy = f.py + f.h/2;
    if(Math.abs(playerX + PW/2 - cx) < f.w/2 + 8 &&
       Math.abs(playerY + PH/2 - cy) < f.h/2 + 8){
      return f;
    }
  }
  return null;
}

/* =========================================================
   ITEMS — spawn
   ========================================================= */
export function pickRandomRoom(notThis){
  const ids = Object.keys(ROOMS).filter(r => r !== notThis);
  return ids[Math.floor(Math.random() * ids.length)];
}

export function spawnItem(){
  if(game.items.length >= game.maxItems) return;
  const inSameRoom = Math.random() < 0.5;
  const roomId = inSameRoom ? game.player.room : pickRandomRoom(game.player.room);

  const isFood = Math.random() < 0.45;
  const list = isFood ? FOOD_LIST : TRASH_LIST;
  const data = list[Math.floor(Math.random() * list.length)];

  for(let tries = 0; tries < 30; tries++){
    const x = 32 + Math.floor(Math.random() * (ROOM_W - 80));
    const y = 32 + Math.floor(Math.random() * (ROOM_H - 80));
    if(isBlockedAt(x, y, roomId, 18, 18)) continue;
    // Nesmí být v dveřních otvorech
    let inDoor = false;
    for(const dir in ROOMS[roomId].doors){
      const d = ROOMS[roomId].doors[dir];
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(dir === 'east'  && x > ROOM_W-48 && y > t1-12 && y < t2+12) inDoor = true;
      if(dir === 'west'  && x < 48        && y > t1-12 && y < t2+12) inDoor = true;
      if(dir === 'south' && y > ROOM_H-48 && x > t1-12 && x < t2+12) inDoor = true;
      if(dir === 'north' && y < 48        && x > t1-12 && x < t2+12) inDoor = true;
    }
    if(inDoor) continue;
    game.items.push({
      x, y, isFood, data,
      room: roomId,
      life: 0,
      bobPhase: Math.random() * Math.PI * 2,
    });
    return;
  }
}

/* =========================================================
   FX
   ========================================================= */
export function addFx(text, x, y, color, life=60){
  game.fx.push({ text, x, y, color, life, age: 0 });
}

/* =========================================================
   POHYB — hráč
   ========================================================= */
function tryMove(p, dx, dy){
  let fx = dx, fy = dy;
  // Pokus zvlášť X a Y - umožní sliding podél stěn
  if(isBlockedAt(p.x + fx, p.y, p.room, PW, PH)) fx = 0;
  if(isBlockedAt(p.x, p.y + fy, p.room, PW, PH)) fy = 0;

  let nx = p.x + fx, ny = p.y + fy;
  const room = ROOMS[p.room];

  // EAST
  if(nx + PW > ROOM_W){
    if(room.doors.east){
      const d = room.doors.east;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.y + PH/2 >= t1 && p.y + PH/2 <= t2){
        p.room = d.target; p.x = TILE - 2; snd_door(); return;
      }
    }
    nx = ROOM_W - PW;
  }
  // WEST
  if(nx < 0){
    if(room.doors.west){
      const d = room.doors.west;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.y + PH/2 >= t1 && p.y + PH/2 <= t2){
        p.room = d.target; p.x = ROOM_W - TILE - PW + 2; snd_door(); return;
      }
    }
    nx = 0;
  }
  // SOUTH
  if(ny + PH > ROOM_H){
    if(room.doors.south){
      const d = room.doors.south;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.x + PW/2 >= t1 && p.x + PW/2 <= t2){
        p.room = d.target; p.y = TILE - 2; snd_door(); return;
      }
    }
    ny = ROOM_H - PH;
  }
  // NORTH
  if(ny < 0){
    if(room.doors.north){
      const d = room.doors.north;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.x + PW/2 >= t1 && p.x + PW/2 <= t2){
        p.room = d.target; p.y = ROOM_H - TILE - PH + 2; snd_door(); return;
      }
    }
    ny = 0;
  }

  // Stěny (6px tlusté)
  const WALL = 6;
  if(nx < WALL) nx = WALL;
  if(nx + PW > ROOM_W - WALL) nx = ROOM_W - WALL - PW;
  if(ny < WALL) ny = WALL;
  if(ny + PH > ROOM_H - WALL) ny = ROOM_H - WALL - PH;

  p.x = nx;
  p.y = ny;
}

function updatePlayer(){
  const p = game.player;

  // Schování
  if(pressedThisFrame[' ']){
    if(p.hidden){
      // Vylézt - musíme najít volné místo HNED VEDLE nábytku, jinak by Bolo
      // zůstal uvnitř hitboxu a nemohl by se hnout (jen otáčet).
      const spot = p.hideSpot;
      p.hidden = false;
      p.hideSpot = null;
      if(spot){
        // Zkusíme 4 strany v pořadí dolů, nahoru, vpravo, vlevo.
        // Vybereme první nezablokovanou pozici.
        const candidates = [
          { x: spot.px + spot.w/2 - PW/2, y: spot.py + spot.h + 2 },           // pod
          { x: spot.px + spot.w/2 - PW/2, y: spot.py - PH - 2 },               // nad
          { x: spot.px + spot.w + 2,      y: spot.py + spot.h/2 - PH/2 },      // vpravo
          { x: spot.px - PW - 2,          y: spot.py + spot.h/2 - PH/2 },      // vlevo
        ];
        for(const c of candidates){
          if(!isBlockedAt(c.x, c.y, p.room, PW, PH)
              && c.x >= 8 && c.x + PW <= ROOM_W - 8
              && c.y >= 8 && c.y + PH <= ROOM_H - 8){
            p.x = c.x;
            p.y = c.y;
            break;
          }
        }
      }
      snd_hide();
    } else {
      const spot = findHideSpot(p.x, p.y, p.room);
      if(spot){
        p.hidden = true;
        p.hideSpot = spot;
        p.x = spot.px + spot.w/2 - PW/2;
        p.y = spot.py + spot.h/2 - PH/2;
        snd_hide();
      }
    }
  }
  if(p.hidden){ p.moving = false; return; }

  // Pohyb
  let dx = 0, dy = 0;
  if(keys['arrowleft']  || keys['a']) dx -= 1;
  if(keys['arrowright'] || keys['d']) dx += 1;
  if(keys['arrowup']    || keys['w']) dy -= 1;
  if(keys['arrowdown']  || keys['s']) dy += 1;

  const speed = 2.0;
  if(dx && dy){ dx *= 0.7071; dy *= 0.7071; }
  dx *= speed; dy *= speed;

  if(dx || dy){
    p.moving = true;
    if(Math.abs(dx) > Math.abs(dy)) p.dir = dx > 0 ? 'right' : 'left';
    else                            p.dir = dy > 0 ? 'down'  : 'up';
    tryMove(p, dx, dy);
  } else {
    p.moving = false;
  }

  if(p.moving){
    p.frameTimer++;
    if(p.frameTimer > 8){ p.frame = (p.frame + 1) % 2; p.frameTimer = 0; }
  } else {
    p.frame = 0;
  }

  // Sebrání věcí
  for(let i = game.items.length - 1; i >= 0; i--){
    const it = game.items[i];
    if(it.room !== p.room) continue;
    if(rectsCollide(p.x - 4, p.y, PW + 8, PH + 6, it.x, it.y, 27, 27)){
      eatItem(it);
      game.items.splice(i, 1);
    }
  }
}

function eatItem(it){
  if(it.isFood){
    game.score += it.data.pts;
    game.tummy = Math.max(0, game.tummy - 3);
    addFx('+' + it.data.pts, it.x, it.y - 4, '#5ab44a', 50);
    snd_yum();
  } else {
    game.score += it.data.pts;
    let tummyHit = it.data.tummy;
    let caught = false;

    const o = game.owner;
    if(!game.player.hidden && o.room === game.player.room){
      const dist = Math.hypot(o.x - game.player.x, o.y - game.player.y);
      if(dist < 140){
        const dx = (game.player.x - o.x), dy = (game.player.y - o.y);
        let inFront = false;
        if(o.dir === 'down'  && dy > -16) inFront = true;
        if(o.dir === 'up'    && dy <  16) inFront = true;
        if(o.dir === 'right' && dx > -16) inFront = true;
        if(o.dir === 'left'  && dx <  16) inFront = true;
        if(inFront){
          tummyHit += 18;
          caught = true;
          o.angryTimer = 120;
          addFx('Bolo!', o.x, o.y - 16, '#fa8090', 80);
          snd_caught();
        }
      }
    }

    game.tummy += tummyHit;
    addFx('+' + it.data.pts, it.x, it.y - 4, caught ? '#fa8090' : '#f0c828', 50);
    addFx('-' + tummyHit + ' bříško', it.x - 8, it.y + 12, '#fa8090', 60);
    if(!caught) snd_munch();

    if(game.tummy >= 100){
      game.tummy = 100;
      gameOver();
    }
  }
}

/* =========================================================
   AI PANIČKY
   ========================================================= */
function updateOwner(){
  const o = game.owner;
  if(o.angryTimer > 0) o.angryTimer--;

  if(o.target){
    const dx = o.target.x - o.x;
    const dy = o.target.y - o.y;
    const d = Math.hypot(dx, dy);
    if(d < 3){
      o.target = null;
      o.waitTimer = 90 + Math.floor(Math.random() * 120);
      o.moving = false;
    } else {
      const speed = 1.2;
      const mx = (dx/d) * speed, my = (dy/d) * speed;
      o.moving = true;
      if(Math.abs(mx) > Math.abs(my)) o.dir = mx > 0 ? 'right' : 'left';
      else                            o.dir = my > 0 ? 'down'  : 'up';
      const nx = o.x + mx, ny = o.y + my;
      if(!isBlockedAt(nx, o.y, o.room, OW, OH)) o.x = nx;
      if(!isBlockedAt(o.x, ny, o.room, OW, OH)) o.y = ny;
      const WALL = 6;
      if(o.x < WALL) o.x = WALL;
      if(o.x + OW > ROOM_W - WALL) o.x = ROOM_W - WALL - OW;
      if(o.y < WALL) o.y = WALL;
      if(o.y + OH > ROOM_H - WALL) o.y = ROOM_H - WALL - OH;
    }
  } else {
    o.moving = false;
    o.waitTimer--;
    if(o.waitTimer <= 0){
      // 35% jiná místnost
      if(Math.random() < 0.35){
        const newRoom = pickRandomRoom(o.room);
        const doors = ROOMS[o.room].doors;
        const dirEntry = Object.entries(doors).find(([k,v]) => v.target === newRoom);
        if(dirEntry){
          const [dir, d] = dirEntry;
          o.room = newRoom;
          if(dir === 'east')  { o.x = TILE - 2;             o.y = d.range[0]*TILE + 16; }
          if(dir === 'west')  { o.x = ROOM_W - TILE - OW;   o.y = d.range[0]*TILE + 16; }
          if(dir === 'south') { o.y = TILE - 2;             o.x = d.range[0]*TILE + 16; }
          if(dir === 'north') { o.y = ROOM_H - TILE - OH;   o.x = d.range[0]*TILE + 16; }
        }
      }
      let tx, ty;
      for(let tries=0; tries<20; tries++){
        tx = 24 + Math.random() * (ROOM_W - 60);
        ty = 24 + Math.random() * (ROOM_H - 80);
        if(!isBlockedAt(tx, ty, o.room, OW, OH)) break;
      }
      o.target = { x: tx, y: ty };
    }
  }

  if(o.moving){
    o.frameTimer++;
    if(o.frameTimer > 12){ o.frame = (o.frame + 1) % 2; o.frameTimer = 0; }
  } else {
    o.frame = 0;
  }
}

/* =========================================================
   UPDATE PLAY
   ========================================================= */
export function updatePlay(){
  game.tick++;
  game.gameTimer++;
  updatePlayer();
  updateOwner();

  // Spawn
  game.spawnTimer--;
  if(game.spawnTimer <= 0){
    spawnItem();
    game.spawnTimer = game.spawnInterval;
  }

  // Difficulty
  if(game.gameTimer % 600  === 0 && game.spawnInterval > 70) game.spawnInterval = Math.max(70, game.spawnInterval - 20);
  if(game.gameTimer % 1500 === 0 && game.maxItems < 12) game.maxItems++;

  // Regen bříška
  if(game.tick % 90 === 0 && game.tummy > 0) game.tummy = Math.max(0, game.tummy - 1);

  // FX
  for(let i = game.fx.length - 1; i >= 0; i--){
    const f = game.fx[i];
    f.age++;
    f.y -= 0.5;
    if(f.age >= f.life) game.fx.splice(i, 1);
  }

  // Items lifetime
  for(let i = game.items.length - 1; i >= 0; i--){
    const it = game.items[i];
    it.life++;
    if(it.life > 60*30) game.items.splice(i, 1);
  }
}
