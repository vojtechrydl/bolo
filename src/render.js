/* =========================================================
   RENDER — vykreslování herního světa
   HUD a menu jsou HTML overlay (ne canvas) → ostrý čitelný text.
   ========================================================= */

import { ctx, W, H } from './config.js';
import { STATE, game } from './state.js';
import { ROOMS, ROOM_BG } from './rooms.js';
import { getFurnitureCanvas } from './furniture.js';
import { findHideSpot } from './game.js';
import {
  BOLO_DOWN, BOLO_UP, BOLO_LEFT, BOLO_RIGHT,
  BOLO_HIDE,
  OWNER_DOWN, OWNER_UP, OWNER_LEFT, OWNER_RIGHT, ALERT_SPR,
} from './sprites.js';

/* ---------- World render ---------- */
function renderRoom(){
  const roomId = game.player.room;
  ctx.drawImage(ROOM_BG[roomId], 0, 0);

  // Y-sort: nábytek + entity dohromady, vykreslíme od nejvyšší y
  const drawables = [];

  for(const f of ROOMS[roomId].furniture){
    if(f.type === 'counter') continue; // kreslí se v BG
    drawables.push({ y: f.py + f.h, draw: () => {
      const c = getFurnitureCanvas(f.type);
      if(c) ctx.drawImage(c, f.px, f.py);
    }});
  }

  // items
  for(const it of game.items){
    if(it.room !== roomId) continue;
    drawables.push({ y: it.y + 24, draw: () => {
      const bob = Math.sin(game.tick*0.1 + it.bobPhase) * 1.5;
      // stín
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(it.x + 13), Math.floor(it.y + 26), 10, 3, 0, 0, Math.PI*2);
      ctx.fill();
      // 1.5x scaled
      const w = it.data.spr.width;
      const h = it.data.spr.height;
      ctx.drawImage(
        it.data.spr,
        Math.floor(it.x), Math.floor(it.y + bob),
        Math.floor(w * 1.5), Math.floor(h * 1.5)
      );
      // sparkle (jen pro nové itemy)
      if(it.life < 30 && it.life % 8 < 4){
        ctx.fillStyle = '#fdfdef';
        ctx.fillRect(Math.floor(it.x + 22), Math.floor(it.y + bob), 2, 2);
        ctx.fillStyle = '#f0c828';
        ctx.fillRect(Math.floor(it.x + 23), Math.floor(it.y + bob - 1), 1, 1);
      }
    }});
  }

  // hráč
  const p = game.player;
  drawables.push({
    y: p.hidden ? p.y - 200 : p.y + 22,
    draw: () => {
      if(p.hidden){
        ctx.drawImage(BOLO_HIDE, Math.floor(p.x - 4), Math.floor(p.y - 12));
        return;
      }
      // stín
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(p.x + 12), Math.floor(p.y + 32), 12, 4, 0, 0, Math.PI*2);
      ctx.fill();
      const frames =
        p.dir === 'down'  ? BOLO_DOWN  :
        p.dir === 'up'    ? BOLO_UP    :
        p.dir === 'right' ? BOLO_RIGHT : BOLO_LEFT;
      // kreslíme 1.5× zvětšeně, aby byl Bolo na 480×360 viditelný
      const sprW = frames[p.frame].width;
      const sprH = frames[p.frame].height;
      ctx.drawImage(
        frames[p.frame],
        Math.floor(p.x - 6),       // posun o -6 aby zůstal vystředěný
        Math.floor(p.y - 12),
        Math.floor(sprW * 1.5),
        Math.floor(sprH * 1.5)
      );
    }
  });

  // panička
  const o = game.owner;
  if(o.room === roomId){
    drawables.push({ y: o.y + 32, draw: () => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(o.x + 14), Math.floor(o.y + 50), 12, 4, 0, 0, Math.PI*2);
      ctx.fill();
      const frames =
        o.dir === 'down'  ? OWNER_DOWN  :
        o.dir === 'up'    ? OWNER_UP    :
        o.dir === 'right' ? OWNER_RIGHT : OWNER_LEFT;
      const sprW = frames[o.frame].width;
      const sprH = frames[o.frame].height;
      ctx.drawImage(
        frames[o.frame],
        Math.floor(o.x - 5),
        Math.floor(o.y - 14),
        Math.floor(sprW * 1.4),
        Math.floor(sprH * 1.4)
      );
      if(o.angryTimer > 0 && (o.angryTimer % 10 < 7)){
        ctx.drawImage(ALERT_SPR, Math.floor(o.x + 8), Math.floor(o.y - 24));
      }
    }});
  }

  drawables.sort((a, b) => a.y - b.y);
  for(const d of drawables) d.draw();

  // FX (plovoucí texty) - na canvasu, ale s velkým fontem
  for(const f of game.fx){
    const fade = f.age > f.life - 15 ? (f.life - f.age) / 15 : 1;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    ctx.fillText(f.text, Math.floor(f.x)+1, Math.floor(f.y)+1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, Math.floor(f.x), Math.floor(f.y));
    ctx.globalAlpha = 1;
  }
}

/* ---------- Title screen na canvasu (jen pozadí) ---------- */
function renderTitleBg(){
  // gradient-ish pozadí - 2 vrstvy obdélníků
  ctx.fillStyle = '#1a1620';
  ctx.fillRect(0, 0, W, H);
  // hvězdy
  ctx.fillStyle = '#3a3245';
  for(let i=0;i<60;i++){
    const x = (i*73 + game.tick*0.3) % W;
    const y = (i*107) % H;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
  // pár jasnějších
  ctx.fillStyle = '#fdfdef';
  for(let i=0;i<8;i++){
    const x = (i*199 + game.tick*0.1) % W;
    const y = (i*87 + 30) % H;
    ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2);
  }
}

/* ---------- Game over - rozmazání aktuální scény ---------- */
function renderGameOverBg(){
  if(ROOM_BG[game.player.room]){
    ctx.drawImage(ROOM_BG[game.player.room], 0, 0);
    ctx.fillStyle = 'rgba(10,10,20,0.65)';
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#1a1620';
    ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- Hlavní render ---------- */
export function render(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if(game.state === STATE.TITLE){
    renderTitleBg();
  } else if(game.state === STATE.PLAYING){
    renderRoom();
  } else if(game.state === STATE.GAME_OVER){
    renderGameOverBg();
  }
}
