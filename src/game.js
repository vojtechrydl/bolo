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

/* =========================================================
   GAME FLOW
   ========================================================= */
export function startGame(){
  game.state = STATE.PLAYING;
  game.tick = 0;
  game.score = 0;
  game.tummy = 0;
  game.spawnTimer = 60;
  game.spawnInterval = 180;
  game.gameTimer = 0;
  game.maxItems = 6;
  game.player.x = 160;
  game.player.y = 120;
  game.player.dir = 'down';
  game.player.room = 'kitchen';
  game.player.hidden = false;
  game.player.hideSpot = null;
  game.owner.x = 160;
  game.owner.y = 100;
  game.owner.dir = 'down';
  game.owner.room = pickRandomRoom('kitchen');
  game.owner.target = null;
  game.owner.waitTimer = 60;
  game.owner.angryTimer = 0;
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
   KOLIZE — proti nábytku
   ========================================================= */
export function rectsCollide(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

export function getBlockingFurniture(roomId){
  return ROOMS[roomId].furniture.filter(f => f.type !== 'bowl' && f.type !== 'bush');
}

export function isBlockedAt(x, y, roomId, w=10, h=8){
  const furn = getBlockingFurniture(roomId);
  for(const f of furn){
    if(rectsCollide(x, y, w, h, f.px, f.py, f.w, f.h)) return f;
  }
  return null;
}

export function findHideSpot(playerX, playerY, roomId){
  const room = ROOMS[roomId];
  for(const f of room.furniture){
    if(!f.hide) continue;
    const cx = f.px + f.w/2, cy = f.py + f.h/2;
    if(Math.abs(playerX+8 - cx) < f.w/2 + 4 && Math.abs(playerY+8 - cy) < f.h/2 + 4){
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
  const inSameRoom = Math.random() < 0.4;
  const roomId = inSameRoom
    ? game.player.room
    : pickRandomRoom(game.player.room);

  // 45% jídlo, 55% nejedlé
  const isFood = Math.random() < 0.45;
  const list = isFood ? FOOD_LIST : TRASH_LIST;
  const data = list[Math.floor(Math.random() * list.length)];

  for(let tries = 0; tries < 30; tries++){
    const x = 24 + Math.floor(Math.random() * (ROOM_W - 48));
    const y = 24 + Math.floor(Math.random() * (ROOM_H - 48));
    if(isBlockedAt(x, y, roomId, 14, 14)) continue;
    let inDoor = false;
    for(const dir in ROOMS[roomId].doors){
      const d = ROOMS[roomId].doors[dir];
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(dir === 'east'  && x > ROOM_W-32 && y > t1-8 && y < t2+8) inDoor = true;
      if(dir === 'west'  && x < 32        && y > t1-8 && y < t2+8) inDoor = true;
      if(dir === 'south' && y > ROOM_H-32 && x > t1-8 && x < t2+8) inDoor = true;
      if(dir === 'north' && y < 32        && x > t1-8 && x < t2+8) inDoor = true;
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
  const blockA = isBlockedAt(p.x + dx, p.y, p.room, 12, 10);
  const blockB = isBlockedAt(p.x, p.y + dy, p.room, 12, 10);
  let fx = blockA ? 0 : dx;
  let fy = blockB ? 0 : dy;
  let nx = p.x + fx, ny = p.y + fy;

  const room = ROOMS[p.room];

  // EAST
  if(nx + 12 > ROOM_W){
    if(room.doors.east){
      const d = room.doors.east;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.y + 8 >= t1 && p.y + 8 <= t2){
        p.room = d.target;
        p.x = TILE + 2;
        snd_door();
        return;
      }
    }
    nx = ROOM_W - 12;
  }
  // WEST
  if(nx < 0){
    if(room.doors.west){
      const d = room.doors.west;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.y + 8 >= t1 && p.y + 8 <= t2){
        p.room = d.target;
        p.x = ROOM_W - TILE - 14;
        snd_door();
        return;
      }
    }
    nx = 0;
  }
  // SOUTH
  if(ny + 14 > ROOM_H){
    if(room.doors.south){
      const d = room.doors.south;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.x + 8 >= t1 && p.x + 8 <= t2){
        p.room = d.target;
        p.y = TILE + 2;
        snd_door();
        return;
      }
    }
    ny = ROOM_H - 14;
  }
  // NORTH
  if(ny < 0){
    if(room.doors.north){
      const d = room.doors.north;
      const t1 = d.range[0]*TILE, t2 = (d.range[1]+1)*TILE;
      if(p.x + 8 >= t1 && p.x + 8 <= t2){
        p.room = d.target;
        p.y = ROOM_H - TILE - 16;
        snd_door();
        return;
      }
    }
    ny = 0;
  }

  // okraje
  if(ROOMS[p.room].floor !== 'grass'){
    if(nx < TILE) nx = TILE;
    if(nx + 12 > ROOM_W - TILE) nx = ROOM_W - TILE - 12;
    if(ny < TILE) ny = TILE;
    if(ny + 14 > ROOM_H - TILE) ny = ROOM_H - TILE - 14;
  } else {
    if(nx < 6) nx = 6;
    if(nx + 12 > ROOM_W - 6) nx = ROOM_W - 6 - 12;
    if(ny < 6) ny = 6;
    if(ny + 14 > ROOM_H - 8) ny = ROOM_H - 8 - 14;
  }

  p.x = nx;
  p.y = ny;
}

function updatePlayer(){
  const p = game.player;

  // Schování
  if(pressedThisFrame[' ']){
    if(p.hidden){
      p.hidden = false;
      p.hideSpot = null;
      snd_hide();
    } else {
      const spot = findHideSpot(p.x, p.y, p.room);
      if(spot){
        p.hidden = true;
        p.hideSpot = spot;
        p.x = spot.px + spot.w/2 - 8;
        p.y = spot.py + spot.h/2 - 4;
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

  const speed = 1.4;
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

  // Anim
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
    if(rectsCollide(p.x, p.y, 14, 14, it.x, it.y, 14, 14)){
      eatItem(it);
      game.items.splice(i, 1);
    }
  }
}

function eatItem(it){
  if(it.isFood){
    game.score += it.data.pts;
    game.tummy = Math.max(0, game.tummy - 3);
    addFx('+' + it.data.pts, it.x + 4, it.y, '#5ab44a', 50);
    snd_yum();
  } else {
    game.score += it.data.pts;
    let tummyHit = it.data.tummy;
    let caught = false;

    // Vidí mě panička?
    const o = game.owner;
    if(!game.player.hidden && o.room === game.player.room){
      const dist = Math.hypot(o.x - game.player.x, o.y - game.player.y);
      if(dist < 110){
        const dx = (game.player.x - o.x), dy = (game.player.y - o.y);
        let inFront = false;
        if(o.dir === 'down'  && dy > -10) inFront = true;
        if(o.dir === 'up'    && dy <  10) inFront = true;
        if(o.dir === 'right' && dx > -10) inFront = true;
        if(o.dir === 'left'  && dx <  10) inFront = true;
        if(inFront){
          tummyHit += 15;
          caught = true;
          o.angryTimer = 90;
          addFx('BOLO!', o.x - 4, o.y - 14, '#e85060', 80);
          snd_caught();
        }
      }
    }

    game.tummy += tummyHit;
    addFx('+' + it.data.pts, it.x + 4, it.y, caught ? '#e85060' : '#f0c828', 50);
    addFx('-' + tummyHit + ' brisko', it.x - 6, it.y + 8, '#e85060', 60);
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
    if(d < 2){
      o.target = null;
      o.waitTimer = 60 + Math.floor(Math.random() * 90);
      o.moving = false;
    } else {
      const speed = 0.85;
      const mx = (dx/d) * speed, my = (dy/d) * speed;
      o.moving = true;
      if(Math.abs(mx) > Math.abs(my)) o.dir = mx > 0 ? 'right' : 'left';
      else                            o.dir = my > 0 ? 'down'  : 'up';
      const nx = o.x + mx, ny = o.y + my;
      if(!isBlockedAt(nx, o.y, o.room, 10, 12)) o.x = nx;
      if(!isBlockedAt(o.x, ny, o.room, 10, 12)) o.y = ny;
      if(o.x < TILE) o.x = TILE;
      if(o.x > ROOM_W - TILE - 12) o.x = ROOM_W - TILE - 12;
      if(o.y < TILE) o.y = TILE;
      if(o.y > ROOM_H - TILE - 18) o.y = ROOM_H - TILE - 18;
    }
  } else {
    o.moving = false;
    o.waitTimer--;
    if(o.waitTimer <= 0){
      // 40% jiná místnost
      if(Math.random() < 0.4){
        const newRoom = pickRandomRoom(o.room);
        const doors = ROOMS[o.room].doors;
        const dirEntry = Object.entries(doors).find(([k,v]) => v.target === newRoom);
        if(dirEntry){
          const [dir, d] = dirEntry;
          o.room = newRoom;
          if(dir === 'east')  { o.x = TILE + 2;            o.y = (d.range[0]+1)*TILE; }
          if(dir === 'west')  { o.x = ROOM_W - TILE - 14;  o.y = (d.range[0]+1)*TILE; }
          if(dir === 'south') { o.y = TILE + 2;            o.x = (d.range[0]+1)*TILE; }
          if(dir === 'north') { o.y = ROOM_H - TILE - 18;  o.x = (d.range[0]+1)*TILE; }
        }
      }
      let tx, ty;
      for(let tries=0; tries<20; tries++){
        tx = TILE + 8 + Math.random() * (ROOM_W - 2*TILE - 24);
        ty = TILE + 8 + Math.random() * (ROOM_H - 2*TILE - 32);
        if(!isBlockedAt(tx, ty, o.room, 10, 12)) break;
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
   UPDATE PLAY — celý herní tick
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

  // Difficulty curve
  if(game.gameTimer % 600  === 0 && game.spawnInterval > 50) game.spawnInterval = Math.max(50, game.spawnInterval - 18);
  if(game.gameTimer % 1500 === 0 && game.maxItems < 12) game.maxItems++;

  // Pomalá regenerace bříška
  if(game.tick % 90 === 0 && game.tummy > 0) game.tummy = Math.max(0, game.tummy - 1);

  // FX
  for(let i = game.fx.length - 1; i >= 0; i--){
    const f = game.fx[i];
    f.age++;
    f.y -= 0.4;
    if(f.age >= f.life) game.fx.splice(i, 1);
  }

  // Items life
  for(let i = game.items.length - 1; i >= 0; i--){
    const it = game.items[i];
    it.life++;
    if(it.life > 60*30){ game.items.splice(i, 1); }
  }
}
