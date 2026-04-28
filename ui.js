/* =========================================================
   UI — propojení HTML overlay s game state
   Updatuje HUD (skóre, brisko, místnost), přepíná title/gameover screeny.
   ========================================================= */

import { game, STATE } from './state.js';
import { ROOMS } from './rooms.js';
import { findHideSpot } from './game.js';
import { isMuted } from './audio.js';

const els = {
  hud:           document.getElementById('hud'),
  score:         document.getElementById('score'),
  roomName:      document.getElementById('room-name'),
  tummyFill:     document.getElementById('tummy-fill'),
  hideHint:      document.getElementById('hide-hint'),
  hiddenMsg:     document.getElementById('hidden-msg'),
  titleScreen:   document.getElementById('title-screen'),
  gameoverScreen:document.getElementById('gameover-screen'),
  startBtn:      document.getElementById('start-btn'),
  restartBtn:    document.getElementById('restart-btn'),
  finalScore:    document.getElementById('final-score'),
  bestFinal:     document.getElementById('best-final'),
  bestLine:      document.querySelector('.best-line'),
  bestScoreTitle:document.getElementById('best-score-title'),
  bestScoreTitleVal: document.querySelector('#best-score-title span'),
  muteIndicator: document.getElementById('mute-indicator'),
};

function show(el){ el && el.classList.remove('hidden'); }
function hide(el){ el && el.classList.add('hidden'); }

let lastState = -1;
let lastScore = -1;
let lastTummy = -1;
let lastRoom  = '';
let lastHidden = null;
let lastHideAvail = null;
let lastMuted = null;

export function updateUI(){
  // State přepínač
  if(game.state !== lastState){
    if(game.state === STATE.TITLE){
      show(els.titleScreen);
      hide(els.gameoverScreen);
      hide(els.hud);
      if(game.best > 0){
        els.bestScoreTitleVal.textContent = game.best;
        show(els.bestScoreTitle);
      }
    } else if(game.state === STATE.PLAYING){
      hide(els.titleScreen);
      hide(els.gameoverScreen);
      show(els.hud);
    } else if(game.state === STATE.GAME_OVER){
      hide(els.titleScreen);
      show(els.gameoverScreen);
      hide(els.hud);
      els.finalScore.textContent = game.score;
      els.bestFinal.textContent = game.best;
      if(game.score === game.best && game.score > 0){
        els.bestLine.classList.add('new-record');
        els.bestLine.querySelector('#best-label').textContent = '🏆 Nový rekord!';
      } else {
        els.bestLine.classList.remove('new-record');
        els.bestLine.querySelector('#best-label').textContent = 'Nejlepší:';
      }
    }
    lastState = game.state;
  }

  // Aktualizace HUD jen v PLAYING stavu
  if(game.state === STATE.PLAYING){
    if(game.score !== lastScore){
      els.score.textContent = String(game.score).padStart(5, '0');
      lastScore = game.score;
    }
    if(game.player.room !== lastRoom){
      els.roomName.textContent = ROOMS[game.player.room].name;
      lastRoom = game.player.room;
    }
    if(game.tummy !== lastTummy){
      const pct = Math.min(100, game.tummy);
      els.tummyFill.style.width = pct + '%';
      let level = '';
      if(pct >= 70) level = 'danger';
      else if(pct >= 40) level = 'warn';
      els.tummyFill.dataset.level = level;
      lastTummy = game.tummy;
    }

    // Schování hint
    const p = game.player;
    if(p.hidden !== lastHidden){
      if(p.hidden){ show(els.hiddenMsg); hide(els.hideHint); }
      else        { hide(els.hiddenMsg); }
      lastHidden = p.hidden;
    }
    if(!p.hidden){
      const avail = !!findHideSpot(p.x, p.y, p.room);
      if(avail !== lastHideAvail){
        if(avail) show(els.hideHint); else hide(els.hideHint);
        lastHideAvail = avail;
      }
    }
  }

  // Mute indikátor (vždy)
  const m = isMuted();
  if(m !== lastMuted){
    if(m) show(els.muteIndicator); else hide(els.muteIndicator);
    lastMuted = m;
  }
}

/* Setup event listenerů na tlačítka */
export function setupUIButtons(onStart){
  els.startBtn.addEventListener('click', e => {
    e.stopPropagation();
    onStart();
  });
  els.restartBtn.addEventListener('click', e => {
    e.stopPropagation();
    onStart();
  });
}
