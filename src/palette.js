/* =========================================================
   PALETA + SPRITE HELPERY
   ========================================================= */

/* 16-barevná retro paleta (GBC / NES feel) */
export const PAL = [
  '#181820',  // 0  near-black
  '#3a261a',  // 1  very dark brown (Bolova srst)
  '#6a3e22',  // 2  dark brown
  '#a8703a',  // 3  brown / wood
  '#e0b070',  // 4  light wood
  '#f0e0a8',  // 5  cream / skin
  '#f5f5e8',  // 6  white (Bolova náprsenka)
  '#a02230',  // 7  dark red
  '#e85060',  // 8  red / pink
  '#f0a8b8',  // 9  light pink
  '#28683a',  // 10 dark green
  '#5ab44a',  // 11 green
  '#f0c828',  // 12 yellow
  '#e88030',  // 13 orange
  '#3068b0',  // 14 blue
  '#7a8090',  // 15 cool gray
];

export const T = -1; // transparent marker for sprite parsing

/* Parsuje pole stringů na 2D pole indexů palety. '.' = transparent. */
export function spr(rows){
  return rows.map(r => Array.from(r).map(c =>
    c === '.' ? T : parseInt(c, 16)
  ));
}

/* Vykreslí parsed sprite do off-screen canvasu (s volitelným zvětšením) */
export function prerender(s, scale = 1){
  const h = s.length, w = s[0].length;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  for(let r=0;r<h;r++){
    for(let col=0;col<w;col++){
      const idx = s[r][col];
      if(idx < 0) continue;
      cx.fillStyle = PAL[idx];
      cx.fillRect(col*scale, r*scale, scale, scale);
    }
  }
  return c;
}

/* Vrátí nový canvas s otočeným spritem (pro směry left/right) */
export function flipped(canv){
  const c = document.createElement('canvas');
  c.width = canv.width; c.height = canv.height;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.translate(canv.width, 0);
  cx.scale(-1, 1);
  cx.drawImage(canv, 0, 0);
  return c;
}
