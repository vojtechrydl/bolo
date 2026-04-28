/* =========================================================
   RENDER — všechny vykreslovací funkce
   ========================================================= */

import { ctx, W, H, HUD_H } from './config.js';
import { PAL } from './palette.js';
import { STATE, game } from './state.js';
import { ROOMS, ROOM_BG } from './rooms.js';
import { getFurnitureCanvas } from './furniture.js';
import { findHideSpot } from './game.js';
import { isMuted } from './audio.js';
import {
  BOLO_DOWN, BOLO_UP, BOLO_LEFT, BOLO_RIGHT,
  BOLO_HIDE, BOLO_SAD, BOLO_BIG,
  OWNER_DOWN, OWNER_UP, OWNER_LEFT, OWNER_RIGHT, ALERT_SPR,
  ITEM_PIZZA, ITEM_SAUSAGE, ITEM_COOKIE, ITEM_APPLE, ITEM_BREAD,
  ITEM_SOCK, ITEM_FLOWER, ITEM_REMOTE,
} from './sprites.js';

/* ---------- Text helpery ---------- */
function drawText(text, x, y, color='#f5f5e8', shadow='#1a1a2a', size=8){
  ctx.font = (size === 8 ? 'bold 8px' : 'bold ' + size + 'px') + ' "Courier New", monospace';
  ctx.textBaseline = 'top';
  if(shadow){
    ctx.fillStyle = shadow;
    ctx.fillText(text, x+1, y+1);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawCenteredText(text, y, color='#f5f5e8', shadow='#1a1a2a', size=8){
  ctx.font = 'bold ' + size + 'px "Courier New", monospace';
  const m = ctx.measureText(text);
  drawText(text, Math.floor((W - m.width)/2), y, color, shadow, size);
}

/* ---------- HUD ---------- */
function renderHUD(){
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = '#3a3a5a';
  ctx.fillRect(0, HUD_H-2, W, 2);
  ctx.fillStyle = '#f0c828';
  ctx.fillRect(0, HUD_H-1, W, 1);

  drawText('SKORE', 6, 4, '#e0b070', '#1a1a1a', 8);
  drawText(String(game.score).padStart(5, '0'), 6, 14, '#f0c828', '#000', 12);

  drawText('BEST ' + String(game.best).padStart(5,'0'), 96, 6, '#7a8090', '#000', 8);
  drawText('@ ' + ROOMS[game.player.room].name, 96, 18, '#f0e0a8', '#000', 8);

  drawText('BRISKO', 200, 4, '#e0b070', '#1a1a1a', 8);
  const barX = 200, barY = 16, barW = 110, barH = 10;
  ctx.fillStyle = '#0c0e1a';
  ctx.fillRect(barX-1, barY-1, barW+2, barH+2);
  ctx.fillStyle = '#3a2818';
  ctx.fillRect(barX, barY, barW, barH);
  const fill = Math.floor((game.tummy/100) * barW);
  let c1, c2;
  if(game.tummy < 40){      c1 = '#5ab44a'; c2 = '#28683a'; }
  else if(game.tummy < 70){ c1 = '#f0c828'; c2 = '#e88030'; }
  else {                    c1 = '#e85060'; c2 = '#a02230'; }
  if(fill > 0){
    ctx.fillStyle = c2; ctx.fillRect(barX, barY, fill, barH);
    ctx.fillStyle = c1; ctx.fillRect(barX, barY, fill, barH-3);
  }
  ctx.fillStyle = '#1a1a2a';
  for(let i=1;i<10;i++) ctx.fillRect(barX + Math.floor(i*barW/10), barY, 1, barH);

  if(isMuted()) drawText('[mute]', W-30, 4, '#7a8090', null, 8);
}

/* ---------- World render (room + entity y-sort) ---------- */
function drawCounter(f, yOff){
  ctx.fillStyle = PAL[3]; ctx.fillRect(f.px, f.py + yOff, f.w, f.h);
  ctx.fillStyle = PAL[4]; ctx.fillRect(f.px, f.py + yOff, f.w, 4);
  ctx.fillStyle = PAL[2]; ctx.fillRect(f.px, f.py + yOff + f.h - 2, f.w, 2);
  // dřez
  ctx.fillStyle = PAL[6];  ctx.fillRect(f.px + 8, f.py + yOff + 6, 12, 8);
  ctx.fillStyle = PAL[15]; ctx.fillRect(f.px + 9, f.py + yOff + 7, 10, 6);
  ctx.fillStyle = PAL[14]; ctx.fillRect(f.px + 14, f.py + yOff + 4, 2, 4);
}

function renderRoom(){
  const roomId = game.player.room;
  ctx.drawImage(ROOM_BG[roomId], 0, HUD_H);

  // Y-sort: nábytek, předměty, hráč, panička
  const drawables = [];

  for(const f of ROOMS[roomId].furniture){
    drawables.push({ y: f.py + f.h, draw: () => {
      const c = getFurnitureCanvas(f.type);
      if(c) ctx.drawImage(c, f.px, f.py + HUD_H);
      else if(f.type === 'counter') drawCounter(f, HUD_H);
    }});
  }

  for(const it of game.items){
    if(it.room !== roomId) continue;
    drawables.push({ y: it.y + 14, draw: () => {
      const bob = Math.sin(game.tick*0.1 + it.bobPhase) * 1.5;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(it.x + 7), Math.floor(it.y + 14 + HUD_H), 6, 2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.drawImage(it.data.spr, Math.floor(it.x), Math.floor(it.y + bob + HUD_H));
      if(it.life < 30 && it.life % 6 < 3){
        ctx.fillStyle = '#f5f5e8';
        ctx.fillRect(Math.floor(it.x + 12), Math.floor(it.y + bob + HUD_H), 2, 2);
        ctx.fillStyle = '#f0c828';
        ctx.fillRect(Math.floor(it.x + 13), Math.floor(it.y + bob + 1 + HUD_H), 1, 1);
      }
    }});
  }

  // hráč: schovaný = pod nábytek (záporné y aby šel dospodu sortu)
  const p = game.player;
  drawables.push({
    y: p.hidden ? p.y - 100 : p.y + 14,
    draw: () => {
      if(p.hidden){
        ctx.drawImage(BOLO_HIDE, Math.floor(p.x - 3), Math.floor(p.y - 8 + HUD_H));
        return;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(p.x + 8), Math.floor(p.y + 16 + HUD_H), 7, 2, 0, 0, Math.PI*2);
      ctx.fill();
      const frames =
        p.dir === 'down'  ? BOLO_DOWN  :
        p.dir === 'up'    ? BOLO_UP    :
        p.dir === 'right' ? BOLO_RIGHT : BOLO_LEFT;
      ctx.drawImage(frames[p.frame], Math.floor(p.x), Math.floor(p.y + HUD_H));
    }
  });

  // panička
  const o = game.owner;
  if(o.room === roomId){
    drawables.push({ y: o.y + 18, draw: () => {
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath();
      ctx.ellipse(Math.floor(o.x + 6), Math.floor(o.y + 18 + HUD_H), 6, 2, 0, 0, Math.PI*2);
      ctx.fill();
      const frames =
        o.dir === 'down'  ? OWNER_DOWN  :
        o.dir === 'up'    ? OWNER_UP    :
        o.dir === 'right' ? OWNER_RIGHT : OWNER_LEFT;
      ctx.drawImage(frames[o.frame], Math.floor(o.x), Math.floor(o.y + HUD_H));
      if(o.angryTimer > 0 && (o.angryTimer % 10 < 7)){
        ctx.drawImage(ALERT_SPR, Math.floor(o.x + 5), Math.floor(o.y - 12 + HUD_H));
      }
    }});
  }

  drawables.sort((a, b) => a.y - b.y);
  for(const d of drawables) d.draw();

  // FX nahoru přes všechno
  for(const f of game.fx){
    const fade = f.age > f.life - 15 ? (f.life - f.age) / 15 : 1;
    ctx.globalAlpha = Math.max(0, fade);
    drawText(f.text, Math.floor(f.x), Math.floor(f.y + HUD_H), f.color, '#000', 8);
    ctx.globalAlpha = 1;
  }

  // Tip "schovej se"
  if(!p.hidden){
    const spot = findHideSpot(p.x, p.y, p.room);
    if(spot){
      const hint = '[MEZERA]';
      ctx.font = 'bold 8px "Courier New", monospace';
      const m = ctx.measureText(hint);
      const tx = Math.floor(p.x + 8 - m.width/2);
      const ty = Math.floor(p.y - 8 + HUD_H);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(tx-2, ty-1, m.width+4, 10);
      drawText(hint, tx, ty, '#f0c828', null, 8);
    }
  }
  if(p.hidden){
    drawCenteredText('— Schoval ses pod nabytek —', H - 16, '#f0e0a8', '#000', 8);
    drawCenteredText('Mezera = ven', H - 8, '#7a8090', '#000', 8);
  }
}

/* ---------- Title screen ---------- */
function renderTitle(){
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(0, 0, W, H);
  // hvězdy v pozadí
  ctx.fillStyle = '#3a3a5a';
  for(let i=0;i<40;i++){
    const x = (i*73 + game.tick*0.3) % W;
    const y = (i*107) % H;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
  ctx.drawImage(BOLO_BIG, W/2 - BOLO_BIG.width/2, 60);

  // jídla obíhají kolem
  const orbit = game.tick * 0.04;
  const items = [ITEM_PIZZA, ITEM_SAUSAGE, ITEM_COOKIE, ITEM_APPLE, ITEM_BREAD, ITEM_SOCK, ITEM_FLOWER, ITEM_REMOTE];
  for(let i=0;i<items.length;i++){
    const a = orbit + (i * Math.PI*2 / items.length);
    const cx = W/2 + Math.cos(a) * 80;
    const cy = 124 + Math.sin(a) * 50;
    ctx.drawImage(items[i], Math.floor(cx-7), Math.floor(cy-7));
  }

  drawCenteredText('BOLO  EATS', 18, '#f0c828', '#7a3010', 24);
  drawCenteredText('— pribeh hladoveho labradoodla —', 44, '#f0e0a8', '#000', 10);

  if(Math.floor(game.tick/30) % 2 === 0){
    drawCenteredText('STISKNI ENTER NEBO KLIKNI', H - 50, '#f5f5e8', '#000', 10);
  }
  drawCenteredText('WASD/sipky = pohyb · MEZERA = schovej se', H - 30, '#7a8090', '#000', 8);
  drawCenteredText('M = zvuk', H - 18, '#7a8090', '#000', 8);

  if(game.best > 0) drawCenteredText('Best: ' + game.best, H - 8, '#f0c828', '#000', 8);
}

/* ---------- Game over ---------- */
function renderGameOver(){
  renderHUD();
  if(ROOM_BG[game.player.room]) ctx.drawImage(ROOM_BG[game.player.room], 0, HUD_H);
  ctx.fillStyle = 'rgba(10,10,20,0.78)';
  ctx.fillRect(0, 0, W, H);

  ctx.drawImage(BOLO_SAD, W/2 - BOLO_SAD.width/2, 50);

  drawCenteredText('GAME  OVER', 16, '#e85060', '#000', 22);
  drawCenteredText('Bolovi je z toho zle...', 36, '#f0a8b8', '#000', 10);
  drawCenteredText('Skore: ' + game.score, 145, '#f0c828', '#000', 14);

  if(game.score === game.best && game.score > 0){
    if(Math.floor(game.tick/15) % 2 === 0){
      drawCenteredText('* NOVY REKORD *', 165, '#5ab44a', '#000', 10);
    }
  } else {
    drawCenteredText('Best: ' + game.best, 165, '#7a8090', '#000', 10);
  }
  if(Math.floor(game.tick/30) % 2 === 0){
    drawCenteredText('ENTER / KLIK = znovu', H - 24, '#f5f5e8', '#000', 10);
  }
}

/* ---------- Hlavní render ---------- */
export function render(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if(game.state === STATE.TITLE){
    renderTitle();
  } else if(game.state === STATE.PLAYING){
    renderHUD();
    renderRoom();
  } else if(game.state === STATE.GAME_OVER){
    renderGameOver();
  }
}
