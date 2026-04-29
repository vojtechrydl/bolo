/* =========================================================
   PALETA + SPRITE HELPERY
   Rozšířená 32-barevná paleta s plynulými přechody.
   Hex 0-9, pak písmena a-v pro indexy 10-31.
   ========================================================= */

export const PAL = [
  /* 0 */ '#0a0810',  // near-black (kontury)
  /* 1 */ '#2a2530',  // tmavá outline
  /* 2 */ '#4a3f50',  // Bolo tělo dark - šedo-fialová
  /* 3 */ '#6a5a70',  // Bolo střední
  /* 4 */ '#8a7a8a',  // Bolo highlight
  /* 5 */ '#5e5468',  // Bolo top highlight (warm gray)
  /* 6 */ '#fdfdef',  // bílá
  /* 7 */ '#e8e3d0',  // off-white
  /* 8 */ '#c8c2b0',  // světle šedá
  /* 9 */ '#888090',  // střední šedá
  /* a */ '#544850',  // tmavě šedá
  /* b */ '#3a323a',  // velmi tmavě šedá
  /* c */ '#fae0c0',  // pleť světlá
  /* d */ '#e8b888',  // pleť střední
  /* e */ '#c08858',  // pleť stín
  /* f */ '#a44030',  // tmavě červená
  /* g */ '#e85060',  // červená
  /* h */ '#fa8090',  // růžová
  /* i */ '#ffb8c8',  // světlá růžová
  /* j */ '#f0c828',  // žlutá
  /* k */ '#e88830',  // oranžová
  /* l */ '#a85820',  // tmavě oranžová
  /* m */ '#7c4a20',  // hnědá tmavá
  /* n */ '#a86a30',  // hnědá střední
  /* o */ '#d49a5a',  // hnědá světlá
  /* p */ '#f0d090',  // krémové dřevo
  /* q */ '#1a4a28',  // tmavě zelená
  /* r */ '#2a7a3a',  // střední zelená
  /* s */ '#4aa848',  // jasná zelená
  /* t */ '#7ac858',  // světlá zelená
  /* u */ '#2858a0',  // modrá
  /* v */ '#4080d0',  // světlá modrá
];

export const T = -1;

function ch(c){
  if(c === '.') return T;
  const code = c.charCodeAt(0);
  if(code >= 48 && code <= 57)  return code - 48;
  if(code >= 97 && code <= 118) return code - 97 + 10;
  return T;
}

export function spr(rows){
  return rows.map(r => Array.from(r).map(ch));
}

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
