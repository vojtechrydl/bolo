/* =========================================================
   MAIN — bootstrap, event wiring, hlavní 60 fps loop
   ========================================================= */

import { canvas } from './config.js';
import { STATE, game } from './state.js';
import { buildAllBackgrounds } from './rooms.js';
import { setupInput, pressedThisFrame, clearPressed } from './input.js';
import { startGame, updatePlay } from './game.js';
import { toggleMute } from './audio.js';
import { render } from './render.js';

/* Pre-build backgrounds všech místností (závisí na DOM canvasu, takže až teď) */
buildAllBackgrounds();

/* Wire input — primary action je start/restart podle stavu */
setupInput(canvas, () => {
  if(game.state === STATE.TITLE || game.state === STATE.GAME_OVER){
    startGame();
  }
});

/* =========================================================
   GAME LOOP — fixed-step 60 fps logika, var-step render
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
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
