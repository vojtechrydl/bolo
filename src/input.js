/* =========================================================
   INPUT — klávesnice + touch
   keys = aktuální stav (drží se), pressedThisFrame = edge-detect
   ========================================================= */

import { initAudio } from './audio.js';

export const keys = Object.create(null);
export const pressedThisFrame = Object.create(null);

const PREVENTED = ['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d','enter','m'];

export function clearPressed(){
  for(const k in pressedThisFrame) delete pressedThisFrame[k];
}

/* Naváže event listenery. onPrimaryAction se zavolá při kliku/tapu (start, restart). */
export function setupInput(canvasEl, onPrimaryAction){
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if(PREVENTED.includes(k)) e.preventDefault();
    if(!keys[k]) pressedThisFrame[k] = true;
    keys[k] = true;
    initAudio(); // unlock audio na první klávesu
  });
  addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    keys[k] = false;
  });
  canvasEl.addEventListener('click', () => {
    initAudio();
    onPrimaryAction();
  });
  canvasEl.addEventListener('touchstart', e => {
    e.preventDefault();
    initAudio();
    onPrimaryAction();
  }, { passive: false });
}
