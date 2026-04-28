# 🐶 Bolo Eats

Pixel-art prohlížečová hra o štěněti labradoodla **Bolovi**, který má jedno životní poslání: **sežrat všechno, co najde**. 🍕🧦📺

Postavená v čistém vanilla JavaScriptu (ES modules), bez build kroku, bez frameworků. Sprite, místnosti, zvuky — všechno generované za běhu pixel po pixelu.

## 🎮 Ovládání

| Klávesa | Akce |
|---|---|
| `WASD` / Šipky | Pohyb Bola |
| `Mezerník` | Schovat se pod nábytek |
| `Enter` | Start / restart |
| `M` | Vypnout / zapnout zvuk |
| Klik / Tap | Start / restart |

## 🎯 Cíl hry

Bolo se prochází po bytě (kuchyň, obývák, ložnice, zahrada) a žere všechno, co najde:

- 🍕 **Jídlo** (rohlík, pizza, párek, sušenka, jablko) → body **+10 až +30**
- 🧦 **Nejedlé věci** (ponožka, papuče, toaleťák, dálkák, kytka, tužka) → body **+5**, ale **plní lištu Bolení bříška**

Když lišta přeteče → **Game Over**. 🤢

Občas přijde **panička**. Když Bola uvidí žrát něco nejedlého, lišta poskočí extra. **Schovej se** pod gauč nebo stůl mezerníkem. 🙈

Postupem času se hra **zrychluje** a přibývá víc předmětů najednou.

## 🚀 Spuštění lokálně

ES moduly potřebují HTTP server (file:// neumožňuje import). Stačí cokoliv:

```bash
# Python (předinstalovaný na macOS/Linuxu)
python3 -m http.server 8080

# Node (npx)
npx serve .

# případně po `npm install` lze spustit přímo
npm start
```

Pak otevři <http://localhost:8080>.

## 📁 Struktura projektu

```
bolo-eats/
├── index.html          # ~10 řádků HTML shellu
├── style.css           # styling kanvasu
├── package.json        # pro Railway deploy přes `serve`
├── README.md
└── src/
    ├── main.js         # entry point, herní smyčka
    ├── config.js       # konstanty, canvas/ctx
    ├── palette.js      # 16-barevná paleta + sprite helpery
    ├── sprites.js      # všechny sprite definice (Bolo, panička, věci)
    ├── furniture.js    # programaticky kreslený nábytek
    ├── rooms.js        # 4 místnosti, pre-rendered pozadí
    ├── audio.js        # Web Audio beepery
    ├── input.js        # klávesnice + touch handlery
    ├── state.js        # globální `game` objekt + STATE enum
    ├── game.js         # logika: kolize, AI paničky, spawn, jedení
    └── render.js       # vykreslování (HUD, místnost, title, game over)
```

## 🚂 Nasazení na Railway přes GitHub

### Možnost A — `serve` (doporučeno)

`package.json` v repozitáři už je nakonfigurovaný. Stačí:

1. Pushni do GitHub repa.
2. Na Railway: **New Project** → **Deploy from GitHub repo** → vyber repo.
3. Railway sám detekuje Node, spustí `npm install` a `npm start`.
4. V **Settings → Networking** klikni **Generate Domain** a máš veřejnou URL. 🎉

### Možnost B — Dockerfile s nginx

Pokud chceš statický web bez Node:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
```

Railway automaticky detekuje Dockerfile a postaví image.

## 🛠️ Technické detaily

- **Vykreslování**: jeden `<canvas>` 320×240 logických pixelů, přes CSS `image-rendering: pixelated` se škáluje integer-multiple do okna. Vypnutý `imageSmoothing` pro ostrý pixel-art.
- **Sprite parser**: každý sprite je pole stringů, znak = index do 16-barevné palety (`.` = transparent). Helper `prerender()` to převede na off-screen `<canvas>` jednorázově při načtení modulu.
- **Bolo**: 16×16, čtyři směry × 2 frames chůze, plus speciální sprity (BOLO_HIDE skrčený pod nábytkem, BOLO_SAD pro Game Over, BOLO_BIG 4× zvětšený pro title).
- **Místnosti**: 4 místnosti v 2×2 mřížce, propojené dveřmi. Pozadí každé místnosti je předgenerované — dlažba (kuchyň), prkna (obývák), koberec (ložnice), tráva (zahrada).
- **Panička**: jednoduchá AI s vidění-kuželem. Občas se přesune dveřmi do jiné místnosti. Když uvidí Bola žrát něco nejedlého, trigger "alert" a lišta extra poskočí.
- **Y-sort rendering**: nábytek, hráč i panička se třídí podle Y pozice, takže entity jdou přirozeně před/za nábytek.
- **Zvuk**: čistě Web Audio API beepery — žádné MP3 ani sample. Mute přes `M`.
- **Persistence**: best score v `localStorage` (s try/catch fallbackem pro privátní režim).
- **Difficulty curve**: `spawnInterval` se zkracuje každých 10 sekund, `maxItems` roste každých 25 sekund.

## ❤️ Pro koho

Pro Bola. Ať mu nikdy doopravdy neunikne ponožka. 🐾

---

Made with 🖤 for a curly puppy named Bolo.
