/* =========================================================
   STATE — STATE enum + globální game objekt
   ========================================================= */

export const STATE = { TITLE: 0, PLAYING: 1, GAME_OVER: 2 };

export const game = {
  state: STATE.TITLE,
  tick: 0,
  player: {
    x: 160, y: 100,
    dir: 'down',
    moving: false,
    frame: 0,
    frameTimer: 0,
    room: 'kitchen',
    hidden: false,
    hideSpot: null,
  },
  owner: {
    x: 80, y: 80,
    dir: 'down',
    moving: false,
    frame: 0,
    frameTimer: 0,
    room: 'living',
    target: null,
    waitTimer: 0,
    angryTimer: 0,
  },
  items: [],     // {x,y,isFood,data,room,life,bobPhase}
  fx: [],        // floating texts and particles
  score: 0,
  tummy: 0,      // 0..100
  spawnTimer: 0,
  spawnInterval: 180,  // ticks (3 sec @ 60 fps)
  gameTimer: 0,
  maxItems: 6,
  best: (function(){
    try { return parseInt(localStorage.getItem('boloEatsBest') || '0', 10) || 0; }
    catch(e){ return 0; }
  })(),
};
