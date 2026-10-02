# Otimizações de desempenho e cache: Brumas Festival

Registro do que foi otimizado no site em **2026-10-02**, por que foi feito e como medir de novo.
Regras permanentes ficam no `AGENTS.md` (seções "Cache" e "Guia de design"). Este documento é o
histórico técnico das otimizações.

---

## Resumo dos resultados

Medições locais (Chrome controlado por Playwright, `index.html`, 1440×900 e 390×844, simulando rolagem
completa e ~20 s de mouse na seção Sobre):

| Métrica | Antes | Depois |
|---|---|---|
| Vídeo de fundo do hero | 9,7 MB (com trilha de áudio inútil) | **0,5 MB** |
| Poster do vídeo do hero | 1,8 MB (PNG 2364×1328) | **22 KB** (JPG 1280px) |
| Emblema de fundo da Galeria | 217 KB | **111 KB** |
| Download total da home (após vídeos) | ~11,6 MB → 2,4 MB* | **~2,2 MB** |
| Tempo até o evento `load` (desktop) | 826 ms | **~500 ms** |
| Layouts recalculados durante o uso | 1.521 | **570** (−62%) |
| Tempo de recálculo de estilo durante o uso | 1,07 s | **0,83 s** |
| CPU com o Sobre parado na tela | ~6%/s | **~4%/s** |
| Memória JS (heap) | 4,1 MB | 4,1 MB (sem vazamento) |
| FPS durante rolagem/mouse | 61 | 61 |

\* A primeira medição já contava com o vídeo novo. O ganho do vídeo sozinho é de 9,2 MB.

**Memória não era o problema:** o heap fica em ~4 MB, não cresce com o uso e partículas, estrelinhas,
ondas e explosões são removidas do DOM ao fim da animação (0 elementos órfãos após o teste). A sensação
de lentidão vinha de **rede** (vídeo de 9,7 MB) e de **trabalho de renderização contínuo**
(recálculo de estilo e repintura a cada quadro).

---

## 1. Rede e carregamento

### Vídeos só depois do carregamento completo
- Todos os `<video>` (fundo do hero, fundo do visualizador de fotos, estandartes do rodapé) usam
  `preload="none" data-lazy-video` e `<source data-src="...">`.
- `loadLazyVideos()` em `js/script.js` troca `data-src` → `src`, chama `load()` e `play()` no evento
  `load` da janela. Até lá aparece só o poster.
- Antes, o vídeo de 9,7 MB competia com CSS, fontes e imagens no carregamento inicial.

### Vídeo do hero recomprimido
- `videos/bg.mp4` (H.264 1280×720, 5 Mbps, **com trilha MP3** num vídeo sempre mudo) →
  `videos/bg-v2.mp4`:
  ```sh
  ffmpeg -i bg.mp4 -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -profile:v high \
    -movflags +faststart bg-v2.mp4
  ```
- `-an` remove o áudio; `crf 30` é imperceptível porque o vídeo fica atrás de uma camada escura com
  névoa (comparado quadro a quadro); `+faststart` permite começar a tocar antes de baixar tudo.
- Poster `poster.png` (1,8 MB) → `poster-v2.jpg` (22 KB).

### Estandartes do rodapé
- Vídeo único (330 KB, 480×706, 5 s, sem áudio) reaproveitado pelos dois estandartes: baixa uma vez.

### Imagens
- Emblema da Galeria (`galeria-emblema-bg-v2.webp`): reexportado a 1000px e qualidade 30, já que é
  exibido com 18% de opacidade.
- Imagens novas do redesign já em WebP (medalhões, estandarte, foto de expositores em 760px).
- Fotos da galeria com `loading="lazy"` e `width`/`height` declarados (evita saltos de layout).

### Google Analytics adiado
- O `gtag.js` (192 KB) era `async` no `<head>` e disputava banda com o carregamento. Agora é injetado só
  no evento `load`, em todas as páginas.

### Scripts
- `js/about-journey.js` com `defer` (só na home).

---

## 2. Renderização (CPU/GPU)

### Seção Sobre: nada de variáveis CSS a cada movimento
Antes, o mouse e a rolagem gravavam variáveis CSS na seção (`--mx`, `--my`, `--progress`, `--tail`,
`--shift`). Cada gravação invalida o estilo de **todos os descendentes**, gerando ~85 recálculos de estilo
por segundo de uso. Agora:
- **Brilho do mouse:** elemento `.about-glow` próprio, movido por `transform: translate3d()`.
- **Fio dourado:** elemento real `.journey-line` + `.journey-line-fill` crescendo por
  `transform: scaleY()` (posição calculada só no `resize`).
- **Parallax dos medalhões:** `transform` direto em cada `.journey-orb`.
- **Classes só mudam quando o estado muda** (`is-sealed`, `is-lit`, `is-awake`), sem `toggle` a cada evento.

### Fundo do Sobre: camadas compostas, sem repintura por quadro
Antes, tudo era **um único SVG grande com `mask-image`**, e as animações internas (anéis girando,
trilhas pulsando) obrigavam o navegador a **repintar a camada inteira a cada quadro**. Agora:
- Cada profundidade é um `<svg>` próprio (`.map-far`, `.map-mid`) com `will-change: transform`; o
  parallax do mouse move esses elementos por `translate`, composto na GPU.
- Astrolábio e rosa dos ventos viraram `<svg>` pequenos girados por CSS (`transform: rotate`, composto).
- Trilhas de tinta deixaram de pulsar (opacidade fixa).
- O anel mágico dos medalhões (`.journey-orb::before`) **só gira durante o hover**; antes girava
  invisível (opacidade 0) o tempo todo.

### Logo do hero
- Antes: `filter: drop-shadow` animado em loop no logo de 600px, repintado a cada quadro.
- Agora: brilho fixo + halo (`#hero h1::after`) pulsando por **opacidade** (composta).

### Pausa fora da tela
- `js/script.js` observa `section`, `footer` e `video` com `IntersectionObserver`: seções fora da tela
  recebem `.is-offscreen` (pausa todas as animações via CSS) e vídeos fora da tela são pausados.
- O Sobre também pausa suas animações próprias (`#sobre.is-paused`).

### Menu no celular
- `backdrop-filter: blur()` do menu fixo removido no celular (caro durante a rolagem); fundo mais
  opaco no lugar. O desktop mantém o desfoque.

### Sem scroll lateral
- `section { overflow-x: clip }` (a névoa pulsante e vídeos com `scale` vazavam da largura da tela).

---

## 3. Cache (incidente em produção)

Em 2026-10-02 o JS novo do Sobre rodou com o `about.css` **antigo** em cache e o fundo apareceu como
formas pretas gigantes. Causa: o `styles.css` importava as seções por `@import` **sem versão**, e o
GitHub Pages serve tudo com `Cache-Control: max-age=600`, ignorando a query string. Proteções criadas
(detalhes no `AGENTS.md`, seção "Cache"):

1. **Hook `.githooks/pre-commit`:** carimba o BUILD em todas as referências estáticas (`<link>`,
   `<script>`, `@import`, `url()` em CSS, `src`/`poster`/`data-src` de imagens e vídeos em HTML e nos
   componentes JS). Falha o commit se sobrar referência sem versão e avisa quando uma mídia é
   sobrescrita mantendo o nome.
2. **Carimbo de build com autocorreção:** `--build` no CSS e `BUILD` no JS. Se divergirem, o navegador
   recarrega as folhas de estilo (até 2 vezes por sessão).
3. **Sentinela por efeito:** o fundo do Sobre só é montado se o CSS daquela versão estiver ativo
   (`--about-fx`).
4. **Mídia trocada ganha nome novo** (`bg-v2.mp4`, `poster-v2.jpg`, `galeria-emblema-bg-v2.webp`).

---

## 4. Como medir de novo

Scripts usados (Playwright do projeto Donorbox, apontando para o Chrome instalado):

- **Métricas gerais:** `Performance.getMetrics` via CDP (heap JS, nós do DOM, contagem e duração de
  layout/recálculo de estilo, tempo de tarefas), tempos de navegação (`domContentLoaded`, `load`, FCP),
  bytes por requisição (`Network.loadingFinished`), FPS por `requestAnimationFrame` e contagem de
  partículas que sobram no DOM.
- **Animações rodando por seção:** `document.getAnimations()` filtrando `playState === 'running'`, e a
  diferença de `RecalcStyleCount` em 5 s parado em cada seção.

Sinais de alerta:
- Recálculos de estilo subindo junto com o movimento do mouse → alguém está gravando variável CSS
  num elemento grande.
- Animação "running" numa seção fora da tela → falta `.is-offscreen`/pausa.
- Heap crescendo após uso → partículas não removidas no `animationend`.

---

## 5. Possíveis próximos passos (não feitos)

- **Font Awesome:** baixa a CSS completa + 2 fontes (~260 KB) para usar ~25 ícones. Dá para trocar por
  SVGs inline ou por um subset.
- **Fontes do Google:** três famílias (MedievalSharp, Cinzel, Gentium). Dá para reduzir pesos e usar
  `font-display: swap` + `preload` da principal.
- **Vídeo em WebM/AV1** como alternativa ao MP4 (mais leve em navegadores compatíveis).
- **Foto de expositores** (128 KB) poderia ter versão `srcset` menor para o celular.
