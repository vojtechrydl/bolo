/* =========================================================
   MAIN — bootstrap a herní smyčka
   ========================================================= */

import { canvas } from './config.js';
import { STATE, game } from './state.js';
import { buildAllBackgrounds } from './rooms.js';
import { setupInput, pressedThisFrame, clearPressed } from './input.js';
import { startGame, updatePlay } from './game.js';
import { toggleMute } from './audio.js';
import { render } from './render.js';
import { updateUI, setupUIButtons } from './ui.js';

/* Pre-build pozadí (potřebuje DOM canvas, takže až tady) */
buildAllBackgrounds();

/* Primary action - klik/tap/Enter v title nebo game-over → start */
function primaryAction(){
  if(game.state === STATE.TITLE || game.state === STATE.GAME_OVER){
    startGame();
  }
}

setupInput(canvas, primaryAction);
setupUIButtons(primaryAction);

/* Klik na canvas v title/gameover také startuje */
canvas.addEventListener('click', () => {
  if(game.state === STATE.TITLE || game.state === STATE.GAME_OVER){
    startGame();
  }
});

/* =========================================================
   GAME LOOP — fixed-step 60fps
   ========================================================= */
let lastTime = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function tick(now){
  const dt = Math.min(100, now - lastTime);
  lastTime = now;
  acc += dt;
  while(acc >= STEP){
    if(game.state === STATE.TITLE){
      if(pressedThisFrame['enter']) startGame();
    } else if(game.state === STATE.PLAYING){
      updatePlay();
    } else if(game.state === STATE.GAME_OVER){
      game.tick++;
      if(pressedThisFrame['enter']) startGame();
    }
    if(pressedThisFrame['m']) toggleMute();
    clearPressed();
    acc -= STEP;
  }
  if(game.state === STATE.TITLE) game.tick++;
  render();
  updateUI();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
