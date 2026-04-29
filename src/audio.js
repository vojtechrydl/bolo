/* =========================================================
   ZVUK — Web Audio API, žádné externí soubory
   ========================================================= */

let audioCtx = null;
let muted = false;

export function initAudio(){
  if(audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch(e){ audioCtx = null; }
}

export function toggleMute(){
  muted = !muted;
  return muted;
}

export function isMuted(){ return muted; }

function beep(freq, dur, type='square', vol=0.08, slide=0){
  if(muted || !audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq+slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(t);
  o.stop(t + dur);
}

export function snd_munch(){
  beep(420, 0.05, 'square', 0.07);
  setTimeout(()=>beep(280, 0.06,'square',0.07), 50);
}
export function snd_yum(){
  beep(523, 0.08, 'square', 0.08);
  setTimeout(()=>beep(659, 0.08, 'square', 0.08), 80);
  setTimeout(()=>beep(784, 0.12, 'square', 0.08), 160);
}
export function snd_ouch(){ beep(180, 0.18, 'sawtooth', 0.10, -80); }
export function snd_caught(){
  beep(880, 0.08, 'square', 0.10);
  setTimeout(()=>beep(880, 0.08, 'square', 0.10), 120);
  setTimeout(()=>beep(660, 0.16, 'sawtooth', 0.10, -200), 240);
}
export function snd_hide(){
  beep(300, 0.06, 'sine', 0.05);
  setTimeout(()=>beep(200, 0.08,'sine',0.05), 60);
}
export function snd_door(){
  beep(400, 0.04, 'square', 0.04);
  setTimeout(()=>beep(500, 0.04, 'square', 0.04), 50);
}
export function snd_gameover(){
  const notes = [440, 415, 392, 370, 349, 330, 311, 294];
  notes.forEach((f,i)=> setTimeout(()=>beep(f, 0.18,'square',0.10), i*120));
}
export function snd_start(){
  beep(523, 0.1, 'square', 0.08);
  setTimeout(()=>beep(659, 0.1, 'square', 0.08), 100);
  setTimeout(()=>beep(784, 0.1, 'square', 0.08), 200);
  setTimeout(()=>beep(1047, 0.18, 'square', 0.09), 300);
}
