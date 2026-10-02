# AGENTS.md — Brumas Festival Medieval

Guia para agentes (Claude Code, Codex etc.) e pessoas que mexem neste repositório.

> **Manutenção deste arquivo (obrigatório):** toda alteração relevante no site (conteúdo de edição,
> páginas criadas/removidas, mudança de fluxo de ingressos/expositores, pendências resolvidas ou novas)
> deve ser registrada aqui **no mesmo commit**. Atualize as seções "Estado atual", "Pendências" e
> "Histórico de atualizações". Pendência resolvida → mova para o histórico com a data.

---

## Visão geral

- Site institucional do **Brumas Festival Medieval** (Guapimirim/RJ): https://brumasfestival.com.br
- Site estático puro: HTML + CSS + JS vanilla, sem build, sem dependências npm.
- Hospedagem: GitHub Pages (arquivo `CNAME`). **O repositório é público**: nunca commitar senhas,
  CPFs, telefones ou planilhas de participantes (ver aviso em `docs/drive-brumas25.md`).
- Existe também um deploy em `brumas-front-end.vercel.app` (usado como `TICKET_SALES_URL` em
  `js/script.js`).
- Idioma: português (pt-BR). Textos voltados ao público usam o tom "medieval" (vós, vosso, reino,
  arautos, Brumas) — mantenha esse tom em textos novos.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Home (hero, Sobre, Galeria, Expositores, Local; footer; Organizadores abaixo do footer) |
| `ingressos.html` | Hoje: aviso de vendas encerradas. Em edição ativa: formulário de compra |
| `expositores.html` | Formulário de expositores (hoje: lista de interesse 2027) → Google Apps Script |
| `expositores-2026.html` | Redireciona para `expositores.html` (o hotsite de urgência 2026 foi removido) |
| `pagamento-confirmado.html` | Retorno do checkout (ainda cita 19/09/2026) |
| `photo-viewer.html` | Visualizador das fotos da galeria (`?id=`); estilos em `css/sections/photo-viewer.css` (linkado só nessa página); compartilhamento em `js/photo-share.js` |
| `galeria/foto-N.html` + `assets/og/foto-N.jpg` + `assets/stories/foto-N.jpg` | **Gerados** por `scripts/gerar-compartilhamento.py` (prévia de cada foto para WhatsApp/Facebook). Rodar de novo sempre que `PHOTOS` mudar |
| `termos-participantes.html`, `termos-expositores.html` | Termos (fonte em `termos_*.md`) |
| `_expositores.html` | Arquivo antigo; ignorado pelo hook de cache busting |
| `js/script.js` | **Dados do site**: `PRICES`, `TICKET_SALES_URL`, `TICKETS`, `NAV_LINKS`, `PHOTOS`, `CONTACT`, `SOCIAL_LINKS`, `ATTRACTIONS` |
| `js/components.js` | Web components: header, footer (com contato: email, WhatsApp, redes), tickets, galeria; `contact-component`/`social-component` seguem definidos mas sem uso na home |
| `js/ticket-form.js`, `js/merchant-form.js`, `js/form-handler.js`, `js/spam-protection.js` | Lógica dos formulários |
| `css/styles.css` | Importa base, layout, componentes, seções e decorativos |
| `assets/brumas-2027/` | Arte 2027 da seção Sobre (medalhões coroa, pergaminho e cavalo) em WebP |
| `assets/pictues/` | Fotos da galeria (`nome.webp` + `nome_sm.webp`) — sim, a pasta é "pictues" |
| `docs/` | Referências internas: conteúdo do Drive, menções na imprensa, `pesquisa-web-brumas.md` (varredura da web em 2026-10-02), `otimizacoes-desempenho.md` (o que foi otimizado e como medir) |
| `sitemap.xml`, `robots.txt` | SEO técnico |

## Convenções

- **Menu:** `NAV_LINKS` em `js/script.js`. O link é gerado como `index.html#<rótulo sem acento em
  minúsculas>`, então o `id` da seção precisa bater (ex.: `'Ingressos'` → `<section id="ingressos">`).
  Rótulos com espaço não funcionam como âncora.
- **Galeria:** adicionar em `PHOTOS` e colocar os arquivos `.webp` e `_sm.webp` em `assets/pictues/`.
- **Cache busting:** o hook `.githooks/pre-commit` reescreve `?v=` em CSS/JS de todos os `*.html` da
  raiz (exceto `_*.html`) a cada commit. Configurar uma vez por máquina:
  `git config core.hooksPath .githooks`.
- **Seções desativadas:** Programação e Atrações estão em `index.html` com `display: none` e fora do
  menu (comentadas em `NAV_LINKS`). Para reativar, remova o `display: none` e descomente no menu.
- **SEO:** ao mudar datas/edição, atualize `<meta>`/Open Graph/JSON-LD das páginas e o `sitemap.xml`
  (`lastmod`). Página que não deve ser indexada → `<meta name="robots" content="noindex, follow">` e
  remover do sitemap. Há uma skill local em `.claude/skills/seo/`.
- **Commits:** mensagens em português, curtas, no formato "Área: o que mudou".
- **Verificação visual:** servir com `python3 -m http.server` e conferir no navegador (ou Chrome
  headless com `--screenshot`). Não há testes automatizados.

---

## Cache — guardrails (LEIA antes de mexer em CSS/JS/mídia)

O GitHub Pages serve tudo com `Cache-Control: max-age=600` (10 min no navegador, mais a CDN) e **ignora a
query string** (`?v=` só serve para mudar a chave do cache). Em 2026-10-02 o JS novo do Sobre rodou com o
`about.css` antigo (importado por `@import` sem versão) e o fundo virou formas pretas gigantes em produção.
Proteções em camadas:

1. **Hook `.githooks/pre-commit`** (precisa de `git config core.hooksPath .githooks`): carimba o BUILD
   (hash da árvore) em **todas** as referências estáticas — `<link>`/`<script>` dos HTMLs, `src`/`poster`/
   `url()` de `assets/` e `videos/` nos HTMLs, `@import` do `css/styles.css`, `url()` em todos os CSS e
   `src`/`poster` nos templates de `js/components.js`. **Falha o commit** se sobrar `@import` ou CSS/JS sem
   `?v=`, e avisa quando uma mídia é sobrescrita no mesmo nome.
2. **Carimbo de build** — `--build` em `css/base.css` e `const BUILD` em `js/script.js` (os dois atualizados
   pelo hook; não editar à mão). No `load`, o `script.js` compara: se o CSS for de outro build, recarrega
   as folhas com `?v=BUILD&r=<timestamp>` (até 2 tentativas por sessão) e resolve
   `window.BRUMAS_CSS_READY`.
3. **Sentinela por efeito** — JS que gera DOM dependente de CSS novo só monta se o CSS daquela versão
   estiver ativo: `about.css` define `--about-fx: 1` e `about-journey.js` confere antes de `init()`; sem
   ele, mostra o conteúdo sem efeitos.

**Regras:**
- Nunca adicionar CSS fora do `@import` do `styles.css` sem `<link ... ?v=>` (o hook cobre ambos).
- Novo efeito JS que dependa de CSS novo → criar um sentinela `--<nome>-fx` e checar antes de montar.
- Mídia trocada: preferir nome novo (`-v2`) quando referenciada em `js/script.js` (`PHOTOS`) ou em
  `og:image` absolutas — essas não passam pelo hook.
- Commits sem o hook (ex.: pela interface do GitHub) não carimbam nada: evitar.
- HTML continua com cache de até 10 min no GitHub Pages (não dá para mudar cabeçalhos lá); por isso as
  camadas 2 e 3 existem.

## Desempenho — regras (detalhes e medições em `docs/otimizacoes-desempenho.md`)

- Efeitos ligados a mouse/rolagem **não gravam variáveis CSS em elementos grandes**: mover elementos
  próprios por `transform`/`translate`; só trocar classe quando o estado mudar.
- Animações contínuas só com `transform`/`opacity` (nunca `filter`, `box-shadow`, `background-position`
  em loop); nada animando invisível (ex.: anel do orbe só gira no hover).
- SVG animado não fica dentro de uma camada grande com `mask`: separar em `<svg>` próprios compostos.
- Seções fora da tela pausam sozinhas (`.is-offscreen` via `js/script.js`); efeitos novos com loop
  devem respeitar isso.
- Vídeos: `preload="none" data-lazy-video` + `<source data-src>`, sem áudio, `+faststart`.
- Scripts de terceiros (analytics etc.) só depois do `load`.

---

## Guia de design — padrão a seguir (referência: seção Local, out/2026)

> A seção **Local** (`#local`, `css/sections/location.css`) é a **referência de qualidade** do site.
> Ao criar ou redesenhar qualquer seção, siga o método e os estilos abaixo e compare o resultado com ela.

### Método (passo a passo)

1. **Diagnóstico antes de mexer:** listar o que está fraco na seção atual — informação repetida
   (ex.: cidade duplicada), elementos fora da paleta (ex.: botão azul), caixas/cards que só "emolduram"
   sem necessidade, mídia sem acabamento (iframe cru).
2. **Tirar a caixa quando o fundo já resolve:** se a seção já tem fundo próprio (roxo `dark-section` ou
   pergaminho), o conteúdo vai **direto sobre o fundo**, sem `medieval-card` em volta.
3. **Montar a hierarquia de texto** sempre na mesma ordem:
   *eyebrow* → título → descrição curta → filete dourado → lista de detalhes com ícone → ações.
4. **Uma ilustração como âncora visual:** um asset temático (estandarte, medalhão etc.) ocupa uma coluna
   própria, com `drop-shadow`, `aria-hidden="true"`, `alt=""`, `loading="lazy"` e `pointer-events: none`.
   No celular ele encolhe e vai para cima, centralizado (não some).
5. **Mídia emoldurada:** mapas, vídeos e embeds sempre dentro de moldura dourada dupla (ver estilos).
6. **Grid responsivo em 3 degraus:** desktop com colunas (ex.: `200px | 1fr | 1.25fr`), tablet
   (≤1024px) com 2 colunas e a mídia ocupando a largura toda, celular (≤640px) com 1 coluna e texto
   centralizado.
7. **Assets:** converter para WebP com `cwebp -q 85 -alpha_q 100 -resize <~2x a largura exibida> 0`,
   salvar em `assets/` com nome descritivo em minúsculas e hífens. Conferir transparência e sobras de
   recorte antes de usar (ver o caso dos animais em "Sobre", descartados por terem fundo colado).
8. **CSS:** um arquivo por seção em `css/sections/`, com CSS aninhado (`&`), usando as variáveis de
   `base.css`. Nada de estilo inline em marcação nova.
9. **Verificar visualmente antes de entregar:** screenshot com Chrome headless em desktop (1440px) e
   celular (500px). Para isolar a seção, gerar uma cópia temporária do `index.html` que esconde as outras
   seções e troca o `?v=` por um valor aleatório (evita cache), servir com `python3 -m http.server 5501`,
   fotografar e apagar a cópia:
   ```sh
   sed 's|</head>|<style>#hero,#sobre{display:none!important}</style></head>|; s|\.css?v=[a-z0-9]*|.css?v=dev'$RANDOM'|' index.html > _preview.html
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
     --window-size=1440,900 --virtual-time-budget=8000 --screenshot=/tmp/shot.png http://localhost:5501/_preview.html
   rm _preview.html
   ```
10. **Registrar** a mudança no histórico deste arquivo (regra do topo).

### Paleta e tipografia (variáveis em `css/base.css`)

| Uso | Valor |
| --- | --- |
| Roxo profundo (botões, títulos sobre pergaminho) | `--color-deep-purple` `#270d4f` |
| Fundo roxo das seções escuras | `--color-navy` `#401b79` |
| Dourado (bordas, ícones) | `--color-gold` `#a98340` |
| Dourado claro (eyebrow, ícones sobre roxo) | `--color-gold-light` `#c8a050` |
| Brilho dourado (hover) | `--color-gold-glow` `rgba(169,131,64,.5)` |
| Pergaminho (fundo das seções claras) | `--color-parchment` `#e9d4b5` |
| Texto claro | `--color-light` `#f5f5f5` (descrições com 85% de opacidade) |
| Títulos | `--font-medieval` (MedievalSharp) |
| Eyebrow / rótulos | `--font-title` (Cinzel), maiúsculas |
| Corpo | `--font-text` (Gentium Book Plus) |

### Componentes de estilo (copiar de `css/sections/location.css`)

- **Eyebrow:** Cinzel, `0.8rem`, `letter-spacing: 4px`, `uppercase`, cor `--color-gold-light`,
  `margin-bottom: 8px`. Texto curto e temático ("O reino das Brumas").
- **Título da seção interna:** MedievalSharp, `2rem`, cor clara sobre roxo (roxo profundo sobre pergaminho).
- **Descrição:** itálico, `line-height: 1.7`, 85% de opacidade, separada do resto por filete
  `border-bottom: 1px solid rgba(169,131,64,.4)` com `20px` de respiro em cima e embaixo.
- **Lista de detalhes:** `ul` sem marcadores, `gap: 14px`; cada item com ícone Font Awesome dentro de um
  círculo de `34px` (`border: 1px solid --color-gold`, `border-radius: 50%`, ícone `--color-gold-light`,
  `0.9rem`), usando `flex: none` + `width`/`height` fixos (senão o círculo achata no celular).
- **Botão principal (`.map-button`):** fundo `--color-deep-purple`, `border: 2px solid --color-gold`,
  `border-radius: 5px`, MedievalSharp `1.05rem`, `padding: 12px 24px`, ícone à esquerda com `gap: 10px`.
  Hover: **continua roxo** (o fundo dourado chapado foi rejeitado), sobe 2px, borda `--color-gold-light`,
  sombra roxa + brilho dourado suave, e um reflexo de luz (`::after` em gradiente) atravessa o botão.
- **Botão secundário (`.map-button--ghost`):** igual ao principal com fundo transparente; no hover ganha o
  fundo roxo e texto claro. Ações lado a
  lado com `gap: 12px` e `flex-wrap`.
- **Moldura de mídia (`.map-frame`):** `padding: 8px`, `border: 1px solid --color-gold`,
  `border-radius: 6px`, fundo `rgba(8,8,6,.35)`, sombra `0 18px 40px rgba(0,0,0,.35)` e segunda borda
  interna via `::before` (`inset: 3px`, `1px solid rgba(169,131,64,.35)`).
- **Ilustração decorativa:** `filter: drop-shadow(0 12px 24px rgba(0,0,0,.35))`; pode "subir" um pouco
  para fora do alinhamento (`margin-top: -40px`) para parecer pendurada.

### Efeito "Orbe Encantado" (medalhões do Sobre) — ⭐ aprovado com destaque

Hover mágico para elementos circulares (medalhões, ícones, avatares, selos). **O elemento não cresce nem
gira**: ele ganha um anel mágico girando na borda, um halo pulsando e solta partículas aleatórias
douradas e violeta enquanto o mouse estiver em cima. Referência: `.journey-orb` em
`css/sections/about.css` + função `emit()` em `js/about-journey.js`.

**Marcação:** envolver o elemento num wrapper circular (pseudo-elementos não funcionam em `<img>`):
```html
<span class="journey-orb" aria-hidden="true"><img class="journey-medallion" src="..." alt=""></span>
```

**CSS (3 camadas no wrapper):**
- Wrapper: `position: relative; aspect-ratio: 1; border-radius: 50%; z-index: 1`.
- `::before` — **anel mágico**: `inset: -9px`, `conic-gradient` alternando trechos transparentes,
  `--color-gold-light` e violeta `rgba(176,120,230,.9)`; recortado em anel com
  `mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))`;
  `animation: mapSpin 2.4s linear infinite` (girando sempre, só a `opacity` muda: 0 → 1).
- `::after` — **halo**: `inset: -14px`, `radial-gradient` dourado (.28) → violeta (.12) só na borda,
  `animation: orbPulse 1.6s` (scale .97 ↔ 1.04) quando ativo.
- Classe `.is-enchanted` liga as duas camadas (`transition: opacity .4s`).
- Partículas `.orb-particle`: absolutas no centro, tamanho/cor/duração por variáveis (`--size`, `--color`,
  `--life`, `--x0/--y0` → `--x1/--y1`), `box-shadow` da própria cor para brilhar, keyframe `orbParticle`
  (sai da borda, se afasta, encolhe para .2 e some). Variante `.orb-particle--star` com `clip-path` de
  estrela de 4 pontas.

**JS (comportamento):**
- `pointerenter` no item: adiciona `.is-enchanted`, emite **12 partículas** de uma vez e depois **3 a cada
  260ms** (`setInterval`); `pointerleave`: remove a classe e para o intervalo.
- Cada partícula: ângulo aleatório, nasce em 85–105% do raio, viaja +25–70px para fora (com leve subida
  de 15px), 35% de chance de ser estrela, vida 0,8–1,7s, cor sorteada de
  `['#e8c770', '#f6e3a6', '#c8a050', '#b98ae6', '#d9c2f5']`; remove-se no `animationend`.
- `prefers-reduced-motion`: só o anel/halo, sem partículas.

**Cuidados:** o wrapper precisa ficar acima de linhas/fios decorativos (o item pai com `transform` cria
contexto de empilhamento → dar `z-index` ao pai); no celular não há hover — se for usar lá, disparar no
toque. Para reaproveitar, extrair `emit()` para um helper genérico (ex.: `js/enchant.js`) e renomear as
classes para algo neutro (`.enchanted-orb`).

### Outros padrões já aprovados

- **Cards em arco** (antigo "Sobre o Festival", substituído pela jornada; ver git `26e7b05`..): fundo pergaminho claro em gradiente,
  borda dourada dupla (borda + `inset box-shadow`), topo em arco, medalhão sobreposto no topo e losango
  roxo na base. Usar quando houver 3 blocos de texto paralelos.
- **Overlays de fundo quase imperceptíveis** (Galeria): imagem em `::before` com `opacity` ~0.18 e
  `mix-blend-mode: screen`; conteúdo com `z-index: 1`. Fades laterais com `mask-image`, nunca com faixas
  de cor sólida por cima.
- **Seção Expositores** (`css/sections/exhibitors.css`): mesmo método da Local aplicado sobre pergaminho
  — eyebrow em `--color-gold-dark` (o dourado claro some no fundo claro), título roxo, ícones roxos,
  botão ghost com texto roxo, e a âncora visual é uma **foto emoldurada** (moldura dupla, levemente
  girada `rotate(1.5deg)`; no celular vai para cima e sem rotação).
- **Seção Galeria** (`css/sections/gallery.css` + `PhotoGallery` em `js/components.js`): cada foto na
  moldura dupla dourada, legenda **sempre visível** abaixo (Cinzel, maiúsculas, `--color-gold-light`),
  hover com elevação + brilho dourado, e navegação com botões em círculo dourado de 44px (mesmo
  desenho dos ícones da Local) ao redor de um rótulo "N registros".
- **Loop sem emenda em vídeo que não fecha:** cortar o 1º segundo do início e fundi-lo no final:
  ```sh
  ffmpeg -i in.mp4 -filter_complex "[0:v]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[main];\
  [b]trim=end=1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=<dur-2>[out]" \
  -map "[out]" -an -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart out.mp4
  ```
  Conferir comparando o último e o primeiro quadro (`magick compare -metric RMSE`) com a diferença entre
  dois quadros seguidos.
- **Vídeo decorativo com fundo preto** (estandartes ao vento no rodapé): `<video autoplay muted loop
  playsinline>` sem trilha de áudio (`ffmpeg -an`), recortado/comprimido (`crf 26`, `+faststart`) com
  poster JPG; `mix-blend-mode: screen` faz o preto sumir sobre fundo escuro e uma `mask-image` radial leve
  esfuma a borda do quadro. Só funciona sobre fundos escuros. **Armadilha:** se o contêiner do vídeo
  tiver `transform`, `z-index` ou `opacity` (cria contexto de empilhamento), o blend tem de ficar **no
  contêiner**, não no `<video>` — senão o preto aparece como retângulo.
- **Estandarte alto em seção que empilha no celular** (Local): no desktop ocupa uma coluna estreita
  (170px, "pendurado" com `margin-top: -40px`); no celular vira detalhe absoluto no canto superior
  direito (64px) e o texto ao lado ganha `padding-right` — a seção não fica mais comprida.
- **Visualizador de fotos**: mesma linguagem da Galeria — barra superior com botões redondos dourados
  (voltar/fechar) e eyebrow, foto na moldura dupla, título MedievalSharp com filete, e navegação
  "anterior · 01 / 18 · próxima". Atalhos: setas e Esc. Atenção: não usar `<header>`/`<footer>` fora
  de `section` — o `footer` global de `layout.css` vaza estilo.
- **Fundo das seções claras:** só pergaminho + vinheta leve (`radial-gradient` transparente até 55% →
  `rgba(70,40,10,.12)` nos cantos). Texturas de papel foram testadas e **rejeitadas** pelo usuário.
- **Media queries no fim do arquivo:** um bloco `@media` colocado antes das regras base do mesmo
  seletor é sobrescrito (aconteceu no rodapé). Sempre deixar os blocos responsivos no final.
- **Sem scroll lateral:** `section` tem `overflow-x: clip` em `base.css` (a névoa pulsante e vídeos com
  `scale` vazavam). Ao criar decorativos que passam da borda, conferir `scrollWidth === clientWidth`.
- **Seções secundárias compactas** (Expositores, Organizadores): `padding: 60px 5%`, header com
  `margin-bottom` de 24–30px.
- **O que o usuário pediu para evitar:** excesso de ornamentos competindo com o conteúdo (estandartes +
  animais + divisores juntos foram retirados de "Sobre"); preferir **um** elemento ilustrado por seção.

---

## Estado atual — pós-evento 2026 (atualizado em 2026-10-02)

A 2ª edição ("No limiar das Brumas") aconteceu em **19/09/2026** no Caminho das Montanhas,
Rua Francisco Portela, 115 – Cantagalo, Guapimirim/RJ. O site está em **modo pós-evento**,
anunciando que haverá a **3ª edição em 2027** (data ainda não definida).

- Hero: bloco `.hero-info` no padrão do guia — eyebrow "3ª edição · Brumas Festival Medieval", título
  "Nos vemos em 2027" com filete, nota em itálico e botão "Acompanhar Novidades" (Instagram). Sem o badge de edição.
- Seções claras: pergaminho + vinheta leve nos cantos (regra única em `base.css`, `section:not(.dark-section):not(#hero)`). Textura de papel testada e descartada.
- Seções Ingressos, "Brumas 2027" e Contato fora da home; menu sem Ingressos e Contato.
- Contato fica só no rodapé (todas as páginas com `<footer-component>`), em linha compacta.
- Rodapé: logo B no centro + dois estandartes ao vento em vídeo nas laterais (`videos/estandarte-footer.mp4`).
- Local: estandarte roxo alto (`assets/estandarte-local.webp`) à esquerda; no celular, pequeno no canto.
- Organizadores em versão compacta (logos 110px, 84px no celular).
- Galeria com o emblema "B em névoa" (`assets/galeria-emblema-bg.webp`) como sobreposição quase
  imperceptível (`#galeria::before`, opacity 0.18 + `mix-blend-mode: screen`).
  Sem `medieval-divider` abaixo do título (removido a pedido).
- Ingressos: vendas encerradas (`ingressos.html` com aviso, `noindex`, fora do sitemap).
- Expositores: formulário funciona como **lista de interesse 2027**.
- Sobre o Festival: título + `medieval-divider` padrão + 3 cards em arco (HTML/CSS) com os medalhões 2027.
- Galeria: ainda com fotos de **2025** (legenda "Brumas Festival 2025").

## Pendências

- [ ] **Fotos de 2026:** incluir na galeria (`PHOTOS`) e atualizar a legenda da seção Galeria.
- [ ] **Termos de expositores:** metragem da barraca ainda "a ser definida" (cláusula 3.2).
- [ ] **Checkout externo** (`brumas-front-end.vercel.app/ingressos.html`): se não for gerado a
      partir deste repositório, fechar as vendas lá também.
- [ ] **Endereço do local:** listagens públicas do Caminho das Montanhas usam outro endereço (Travessa
      Eng. Paulo de Alencar Araripe, Cantagalo) — confirmar qual vale antes de 2027 (ver `docs/pesquisa-web-brumas.md`).
- [ ] **Google com dados da 1ª edição:** resultados ainda citam Fazenda das Nascentes/Magé e 19/07/2025;
      pedir reindexação no Search Console (home, termos) e reenviar o sitemap. Testar o card novo em
      https://developers.facebook.com/tools/debug/ (força o WhatsApp/Facebook a atualizar a prévia).
- [ ] **Itens inclusos para expositores 2027:** a home diz "barraca de madeira e ponto de energia".
      Confirmar para 2027.
- [ ] **Data da edição 2027:** quando definida, seguir o checklist abaixo.
- [ ] Bug antigo nos dados: `TICKETS[0].description` diz "entrada do dia 25.07.26" (data errada) —
      corrigir ao reabrir as vendas.

## Checklist — reabrir o site para a edição 2027

1. **Hero** (`index.html`, bloco `.hero-info`): eyebrow com edição/tema, data no `<time class="hero-title">`
   (com `datetime`), horário na `.hero-note`, botão principal "Garantir Ingresso" → `TICKET_SALES_URL`.
   (`.edition-badge`, `.event-date` e `.event-time` ainda existem em `hero.css` se preferir o visual antigo.)
2. **Ingressos:** restaurar a seção `#ingressos` na home e o formulário em `ingressos.html`
   (recuperar do git: `git show 24bda16:ingressos.html` e `git show 24bda16:index.html`).
   Atualizar `PRICES`/`TICKETS` em `js/script.js`; descomentar `'Ingressos'` em `NAV_LINKS`
   (ou manter ambos). Remover `noindex` e voltar `ingressos.html` ao sitemap.
3. **Contagem regressiva** (opcional): o easter egg de clique na data + música foi removido de
   `js/script.js`; recuperar com `git show 24bda16:js/script.js` se quiser e atualizar a data.
4. **Expositores:** voltar textos de "lista de interesse" para "inscrição"; revisar termos. Hotsite
   de urgência: recuperar `expositores-2026.html` e `css/sections/expositores-hotsite.css` de
   `24bda16` como base para `expositores-2027.html`.
5. **SEO:** JSON-LD `Festival` (datas, `offers`), meta descriptions, `sitemap.xml`.
6. **Termos:** atualizar "Válido para a edição de..." e a data de atualização.
7. **`pagamento-confirmado.html`:** atualizar a data do evento.
8. Registrar tudo no histórico abaixo.

---

## Histórico de atualizações

### 2026-10-02 — Seção "Sobre o Festival" com a arte 2027
- `index.html`: seção `#sobre` agora tem o título e os 3 cards em arco com medalhões (coroa,
  pergaminho, cavalo), com o `medieval-divider` padrão do site sob o título. Estandartes, animais e o
  divisor do pacote foram testados e retirados a pedido.
- `js/script.js`: `'2027'` removido do menu.
- `index.html`: seção Contato removida (e `'Contato'` comentado em `NAV_LINKS`); contato compacto
  (email, WhatsApp, Instagram, Facebook) adicionado ao rodapé em `js/components.js` + `.footer-contact`
  em `css/layout.css`.
- `css/sections/organizers.css`: seção Organizadores reduzida (menos padding, logos e nomes menores).
- `docs/pesquisa-web-brumas.md`: pesquisa sobre o Brumas na internet (feita por agente secundário).
- Seção Galeria embelezada pelo guia: divisor + legenda em itálico no cabeçalho, fotos com moldura
  dupla e legenda visível, botões anterior/próxima (JS no `PhotoGallery`), seção mais compacta;
  `gallery.css` reescrito (overlay de hover e faixas sólidas removidos).
- Seção Local: estandarte estático trocado por vídeo em loop (`videos/estandarte-local.mp4` + poster
  `videos/estandarte-local-poster.jpg`, gerados do vídeo Gemini sem áudio) com blend `screen`; coluna
  do estandarte passou a 300px. `assets/estandarte-local.webp` ficou sem uso na home.
- Seção Local: vídeo trocado por `ESTANDARDE_VENTO.mp4` (estandarte ao vento), girado 90° (veio deitado),
  recortado, sem áudio, 480x706, ~330 KB. Loop suavizado: o último 1s faz crossfade com o 1º segundo
  (`trim` 1s→fim + `xfade` com o trecho 0–1s; resultado 5,08s). Coluna do estandarte em 240px; máscara
  radial leve só na borda do quadro.
- Vídeo do estandarte movido da Local para o rodapé, renomeado `videos/estandarte-footer.mp4` (+ poster):
  dois estandartes nas laterais do `<footer-component>` (todas as páginas), logo mantida no centro; no
  celular ficam pequenos nos cantos de cima. Estilos em `css/layout.css`.
- Seção Local: novo estandarte roxo alto (`Estandarte Medieval Roxo com Letra B Ornada.png` →
  `assets/estandarte-local.webp`, 340px) em coluna de 170px; mobile otimizado (estandarte no canto,
  texto alinhado à esquerda com ícones ao lado, botões lado a lado, mapa 240px, padding menor).
- Textura de papel nas seções claras testada (2 versões) e removida a pedido; ficou só a vinheta leve
  nos cantos. `#sobre` perdeu o fundo próprio e usa a regra comum. Botão "Conhecer o Festival" do hero
  removido a pedido.
- Mobile: Expositores no mesmo tratamento da Local (texto à esquerda, ícones 30px ao lado do texto com
  separadores tracejados, botões lado a lado). Rodapé no celular: nome em eyebrow dourado, links em grade
  3 colunas (Cinzel maiúsculas, sem sublinhado) entre filetes, contato em lista e redes em círculos
  dourados de 40px (`.footer-social` no `FooterComponent`); estilos no fim de `css/layout.css`.
- Organizadores no celular: lista compacta (logo 64px emoldurada à esquerda, nome ao lado, separadores
  tracejados dourados), menos espaço entre título e lista.
- Sobre o Festival: cards trocados por uma **jornada vertical** — medalhões ligados por fio dourado no
  centro, texto alternando esquerda/direita com numeral romano (I, II, III) em eyebrow; no celular fio e
  medalhões à esquerda e texto à direita (`css/sections/about.css`, `<ol class="about-journey">`).
- Organizadores (desktop): logos na moldura dourada dupla, nomes em Cinzel maiúsculas, separadores
  verticais dourados entre eles; comentários de organizadores antigos removidos do HTML.
- Botões `.map-button` com `white-space: nowrap` e `flex: 1 1 auto` no celular: não quebram o texto,
  empilham quando não cabem lado a lado.
- Rodapé: estandartes dessincronizados — o da direita começa na metade do loop e toca a 0,8x
  (`playbackRate`), então os dois nunca balançam juntos (`FooterComponent`).
- Galeria: foto "Expositores" movida para a 3ª posição (ids de `PHOTOS` renumerados 1–3; o
  `photo-viewer` navega pelo `id`, então os ids devem seguir a ordem do array).
- Sobre o Festival interativo (`js/about-journey.js`, carregado só na home): fundo **medieval e mágico**
  em SVG — trilhas de tinta pulsando, astrolábio lúdico (anéis com fases da lua e pontinhos girando em sentidos opostos, lua
  crescente no centro), constelações que cintilam, faíscas douradas subindo e rosa dos ventos — com **parallax** no
  scroll e **brilho dourado seguindo o mouse** (`--mx/--my`). Pegadas e nomes de lugares (versão "mapa do
  maroto"), runas e hexagrama foram testados e removidos a pedido — **evitar símbolos religiosos**,
  manter o tom lúdico e as animações suaves (10 faíscas, opacidades baixas); passos revelados ao entrar na tela (IntersectionObserver), fio dourado que se preenche com o
  scroll (`--progress`), medalhões com parallax leve (`--shift`) e hover (gira e brilha). Respeita
  `prefers-reduced-motion`.
- Medalhões do Sobre: hover sem crescer/girar — o `<img>` fica num `.journey-orb` que ganha anel mágico
  girando (conic-gradient mascarado) + halo pulsando, e o JS emite partículas douradas/violeta aleatórias
  (bolinhas e estrelinhas) enquanto o mouse estiver em cima.
- Guia de design: documentado o efeito **"Orbe Encantado"** (anel mágico + halo + partículas) para reuso.
- Sobre: faíscas que subiam sozinhas removidas e constelações sem piscar; agora as estrelas **só reagem ao
  mouse** — rastro de estrelinhas atrás do cursor (`.cursor-star`, 1 a cada 70ms) e constelações a
  menos de 220px do cursor se acendem (`.is-lit`).
- Hover dos botões `.map-button` refeito (roxo + elevação + brilho + reflexo), no lugar do dourado chapado.
- Sobre — mais efeitos de mouse no fundo: camadas do mapa com **profundidade** (deslocam-se contra o
  cursor em 3 ritmos, `.map-layer[data-depth]`), astrolábio que **desperta** (brilha) perto do cursor e
  **clique no fundo** = onda dourada (`.magic-ripple`) + explosão de partículas (`burst()`). Efeito de
  título com letras ondulando foi testado e **rejeitado** ("horrível") — não animar títulos.
- Sobre — o fio dourado agora desce até a borda inferior da seção (`--tail` via JS) e, ao encostar nela
  (`#sobre.is-sealed`), abre uma **borda dourada entre as seções** (`.about-seam`, scaleX a partir do
  ponto do fio, com losango no encontro).
- Organizadores movidos para **abaixo do footer** (fora do `<main>`, logo após `<footer-component>`) e
  sem o título "Organizadores"; o link do menu `#organizadores` continua funcionando. Em pergaminho ficou
  estranho, então virou faixa **escura** continuando o footer (filete dourado, logos 84px/64px lado a lado
  inclusive no celular, nomes em Cinzel dourado) — `css/sections/organizers.css` reescrito.
- Menu mobile redesenhado (`css/layout.css` + `HeaderComponent`): botão redondo dourado com 3 barras que
  viram X, painel roxo profundo opaco com brilhos, links em Cinzel maiúsculas com losangos dourados entre
  eles e entrada em cascata, redes em círculos dourados no rodapé do menu (`.nav-extra`, só no mobile),
  página trava a rolagem com o menu aberto (`body:has(#menu-toggle:checked)`). Link fecha o menu sem
  `click()` no checkbox. "Nos vemos em 2027" no menu foi testado e retirado a pedido.
- **Vídeos só após o carregamento completo:** todos os `<video>` (fundo do hero, photo-viewer,
  estandartes do rodapé) usam `preload="none" data-lazy-video` + `<source data-src>`; o `loadLazyVideos()`
  em `js/script.js` troca para `src` e dá play no evento `load`. Até lá aparece só o poster. O hook
  também versiona `data-src`.
- Vídeo de fundo do hero otimizado: `videos/bg.mp4` (9,7 MB, com áudio inútil) → `videos/bg-v2.mp4`
  (0,5 MB, sem áudio, crf 30, faststart); poster `poster.png` (1,8 MB) → `poster-v2.jpg` (22 KB). Nomes
  novos de propósito (guardrail de cache).
- `expositores.html` redesenhada: banner com foto do mercado ao fundo, faixa "como funciona" (3 passos) e
  formulário em pergaminho com moldura dourada dupla em etapas I/II/III (pílulas Sim/Não, select com seta
  dourada). Mesmos `id`/`name` dos campos (planilha e anti-spam intactos). CSS em
  `css/sections/expositores-page.css`; `ticket-form.css`/`merchant-form.css` não são mais usados nela.
- Termos de participantes e expositores atualizados para **2027** ("Válido para a 3ª edição (2027) · data e
  local serão confirmados nos canais oficiais", atualização Outubro de 2026), HTML e `.md`. Participantes:
  10.1 sem "fazenda" (área rural e de natureza) e e-mail de contato corrigido para brumasfestival@gmail.com.
  Expositores: nova 2.5 (lista de interesse 2027 não é inscrição nem reserva) e numeração 6.5→6.4.
- Visualizador de fotos: a névoa em vídeo voltou a ficar **por cima** de tudo (`z-index: 2`,
  `mix-blend-mode: hard-light`, opacidade 0.6, `pointer-events: none`), como na versão original — a fumaça
  passa sobre a foto. Controles (barra superior, título, navegação) ficam **acima** da névoa (`z-index: 3`,
  foto em 1, vídeo em 2) com a cor normal; `.photo-viewer` sem `position: fixed`/z-index/opacity para não isolar as camadas (fixed sempre cria
  contexto de empilhamento).
- Visualizador de fotos — troca suave: a foto nova é pré-carregada e decodificada (`img.decode()`) antes
  de trocar; enquanto isso a atual esmaece e aparece um **loader dourado/violeta** (só se demorar >120ms).
  Foto, título e contador trocam **juntos**; a moldura **anima o tamanho em 300ms** (FLIP com width/height,
  `.is-resizing`). Fotos vizinhas são pré-carregadas; cliques rápidos usam só o último pedido (token).
- **Transição entre páginas** (`css/base.css`): View Transitions entre documentos
  (`@view-transition { navigation: auto }`). A página antiga some com desfoque e leve redução (0,35s) e a
  nova surge subindo do desfoque (0,5s); o menu fixo (`header-component`, `view-transition-name:
  site-header`) não anima. Vale para toda navegação interna (Chrome/Edge 126+, Safari 18.2+; Firefox
  navega normal). Desligada com `prefers-reduced-motion`. Experimento antigo comentado foi removido.
- **Título que viaja entre páginas:** elementos com `data-morph="nome"` nas duas páginas se transformam um no
  outro na transição (index `.exhibitors-info h3` "Mercadores e Artesãos" → banner `h1` de
  `expositores.html`, `data-morph="exp-title"`). JS em `js/script.js` (`pageswap`/`pagereveal`): só dá nome
  aos que estão visíveis nas duas pontas e limpa ao terminar. Para novos pares, basta o mesmo `data-morph`.
- Banner de `expositores.html` com **placeholder em CSS** (gradientes com as cores da foto: osso, aço,
  couro, tecido areia) por baixo da imagem, visível enquanto ela carrega.
- **Âncoras abrem direto na seção:** `scroll-behavior: smooth` só entra depois do `load`
  (`html.smooth-scroll`, posto pelo `js/script.js`); antes, `index.html#expositores` rolava desde o topo.
- Sobre: medalhão do pergaminho trocado (`medallion-scroll-v2.webp`, com estrelas saindo do anel; classe
  `.journey-medallion--starred` aumenta a imagem para o anel ficar do tamanho dos outros).
- **Autoria:** metatags `author`/`creator`, `link rel="author"` (X) e `twitter:creator` (@alfa_dev) em todas
  as páginas; `creator` (Person: Rafael Lopes · Alfa Dev, X, e-mail, telefone) no JSON-LD da home. Faixa
  **"Powered by Alfa Dev Tecnologia"** no fim de todas as páginas com `js/components.js` (incluídos nos
  termos): só um link discreto para https://alfadev.com.br/ (o cartão com contatos foi retirado a pedido). Estilos `.dev-credit` em `css/layout.css`.
- **Foto encantada** (`js/enchant.js`, genérico para `[data-enchant]`): na foto da seção Expositores, luz
  dourada/violeta girando pela moldura (`@property --enchant-angle` + conic-gradient mascarado), halo e
  partículas saindo das bordas (reusa `.orb-particle`). Para usar em outro lugar: `data-enchant` + CSS do
  `::after`/`.is-enchanted` (ver `css/sections/exhibitors.css`).
- Sobre — trilhas pontilhadas **aleatórias e vivas**: 4 traçados sorteados de 3 tipos — **suave** (2 curvas,
  onda larga), **sinuoso** (4–5 curvas, mais amplitude) e **laço** (uma volta no meio; no máximo um por vez) —
  com intensidade de tinta sorteada por ciclo (opacity 0.3–1), que se desenham do início ao fim e logo se apagam do início ao fim, em
  ritmo linear, com pausa aleatória entre ciclos. Animadas pela **Web Animations API** (máscara SVG com
  `pathLength="1000"` e `stroke-dashoffset` 1010 → 0 → −1010). **Nunca piscam:** traçado e duração só
  mudam entre ciclos, com a linha apagada (mudar duração/atraso de animação CSS no meio do ciclo fazia a
  linha saltar). Pausam fora da tela.
- Local: Instagram do local como 3º item da lista de detalhes (ícone em círculo dourado + @handle)
  (`@caminhodasmontanhas_guapi`, handle vindo da pesquisa web — não verificado por exigir login).
- Link "Início" do menu (`index.html#inicio`) não funcionava: não existia `id="inicio"` (o hero é `#hero`).
  Criada a âncora `<div id="inicio">` no topo do `<main>`.
- **Flashes brancos em transições:** o `html` não tinha fundo próprio e as transições de página deslocavam
  (translateY 24px) e encolhiam (scale .98) as páginas, abrindo frestas por onde aparecia branco. Agora as
  transições usam só opacidade + desfoque. (Um `html { background }` escuro chegou a ser colocado e foi
  **revertido**: ele escondia o vídeo de fumaça da capa, que tem z-index negativo. Nunca dar fundo ao `html`.) Regra: nunca
  deslocar/encolher o `root` em view transitions.
- **Retângulo branco no topo ao abrir uma foto:** o menu tem `view-transition-name: site-header` (fica parado
  entre páginas), mas o visualizador não tem menu → o "fantasma" do menu ficava sobre a barra do
  visualizador, e o `backdrop-filter: blur` dele não é capturado em transições (saía branco). Correção:
  menu sem `backdrop-filter` (fundo opaco `rgba(10,7,16,.88)`) e old/new do `site-header` com fade (iguais
  quando o menu existe nas duas páginas, então ele continua parado). Regra: **nada com `backdrop-filter`
  em elementos com `view-transition-name`**.
- Âncoras do menu paravam com o título colado/sob o menu fixo: `html { scroll-padding-top: 70px }` (50px no
  celular, altura do menu). Se a altura do menu mudar, ajustar esse valor.
- **Divisor sumindo (só em `file://`):** `css/base.css` usava `url('../../assets/...')` (só funciona por http,
  onde `..` para na raiz). Corrigido para `../assets/`; o pre-commit agora **falha** se `css/*.css` tiver
  `../../`.
- Formulário de expositores: **estado de erro visível** — ao tentar enviar, cada campo inválido fica vermelho,
  treme e ganha mensagem abaixo (obrigatório, e-mail inválido, WhatsApp incompleto via `pattern`, aceite dos
  termos); some ao corrigir (`js/merchant-form.js`, `.has-error`/`.exp-error`).
- Aceite dos termos com efeito mágico ao marcar, reforçado 2x a pedido (36 partículas, raio maior, pulo com
  giro, clarão `sealGlow` e brilho permanente mais forte; `.is-sealed`).
- **Loading em botões que trocam de página:** `data-loading-link` → ícone vira spinner, largura travada,
  restaura no `pageshow` (voltar). Usado em "Quero Expor em 2027" da home.
- **"Brancão" intermitente nas trocas de página (causa real):** a transição era cruzada (a nova página surgia
  antes de a antiga sumir), então as seções claras (pergaminho) da página antiga apareciam como manchas
  brancas e desfocadas sobre a nova — só quando havia seção clara na tela, por isso intermitente.
  Agora é **sequencial**: antiga some em 0,25s (só opacidade), tela fica escura, nova surge de 0,25s a
  0,65s. Verificado quadro a quadro no Chrome com GPU (galeria→foto, foto→galeria, home→expositores).
  Regra: **nunca sobrepor old/new do root**.
- Local: iframe do Google Maps trocado por **mapa ilustrado** (`assets/mapa-guapimirim.webp`) dentro da moldura;
  arrastável só um pouco (até 10%, com resistência, volta ao centro ao soltar) e clique sem arrastar abre o
  endereço no Google Maps (`.map-illustrated` em `location.css`, JS em `js/script.js`).
- Links do local corrigidos para o ponto exato (-22.5352707, -42.9908409): mapa ilustrado e `CONTACT.address_link` →
  link curto https://maps.app.goo.gl/pCQhvAfJ3on3fJhS7; "Como Chegar" → rota do Google Maps com o endereço exatamente como o Google cadastra
  ("R. Francisco Portela, 115 - Parque Santo Antonio, …", testado: desenha a rota); Waze → `ll=` com as
  coordenadas (a busca por texto com "Cantagalo" caía no lugar errado).
- Botão da capa "Acompanhar Novidades" (`.hero-cta` em `hero.css`): fundo nebulosa (`assets/nebulosa-roxa.webp`),
  **borda dourada fina (1px)**, texto claro normal, seta e reflexo a cada ~6s. Rejeitados a pedido: estrelas
  laterais, texto dourado, borda grossa/dupla e ícone do Instagram em anel. Não usa `.map-button`. Magia: `data-enchant` (hover: luz girando
  na borda + partículas) e `data-enchant-click` (clique: 44 partículas, clarão e onda dourada) — `js/enchant.js`.
- **Compartilhar fotos da galeria** (visualizador): botão "Compartilhar" abre painel com prévia e opções.
  - *Stories e Instagram:* o Instagram não aceita link de compartilhamento vindo de site; o caminho é a
    folha nativa do celular (Web Share API com arquivo), onde aparecem Stories/Feed/Direct. A imagem
    1080x1920 é **pré-gerada** (`assets/stories/foto-N.jpg`, fontes OFL em `scripts/fonts/`) — gerá-la no
    navegador com canvas falhava em `file://`. No computador, baixa a imagem (em `file://`, abre numa aba).
  - *WhatsApp/Facebook/Copiar link:* link `galeria/foto-N.html` — página estática com `og:image` da própria
    foto (prévia certa) que redireciona para `photo-viewer.html?id=N`.
  - *Baixar imagem* e *Mais opções* (folha nativa, só em tela de toque).
  - Botão "voltar" do topo removido (redundante com o "fechar").
  - Testado: file:// e http no desktop, e celular simulado (share recebe o arquivo + texto com link).
- Rodapé: `mix-blend-mode` removido dos estandartes em vídeo (o fundo do rodapé já é preto, não fazia
  diferença); fica só a máscara radial nas bordas.
- Cadeiras removidas da infraestrutura fornecida a expositores (termos 3.2, HTML e `.md`, e home); a 3.3
  já dizia que cadeiras são por conta do expositor.
- Nova foto do mercado (`assets/pictues/brumas_mercado_laminas.webp`, banca de lâminas e bainhas, recorte
  3:2 de `IMG_2025.HEIC`) na seção Expositores da home e no banner de `expositores.html`; a foto antiga
  `brumas_artesaos_medievais_md.webp` saiu (a original continua na galeria).
- **Desempenho:** análise de memória/CPU (heap estável ~4 MB, sem vazamento) e otimizações de
  renderização e rede — ver `docs/otimizacoes-desempenho.md`.
- **Cache:** incidente em produção (JS novo + `about.css` antigo via `@import` sem versão). Criados os
  guardrails da seção "Cache" (hook versiona tudo e falha se faltar; carimbo de build CSS/JS com
  recarga automática; sentinela `--about-fx`).
- **SEO:** imagem de compartilhamento `assets/brumas_share.jpg` (1200x630, logo dourado sobre foto noturna,
  "Guapimirim · RJ — 3ª edição em 2027") no lugar do SVG (redes sociais não exibem SVG) em home, ingressos
  e termos; expositores usa `brumas_expositores_share.jpg`. Títulos/descrições com "Guapimirim (RJ)" e
  "2027"; JSON-LD da home virou `@graph` com **Organization** (sameAs Instagram/Facebook — ajuda a não ser
  confundido com o Festival da Terra Média), WebSite e o Festival 2026; `twitter:*` corrigido para
  `name=`; OG nos termos; `theme-color` roxo; alt das fotos da galeria descritivo; `about-journey.js` com
  `defer`; sitemap com `changefreq`.
- Fio dourado do Sobre passava por cima dos medalhões (cada passo cria contexto de empilhamento pelo
  `transform`); `.journey-step` ganhou `z-index: 1`.
- Scroll lateral corrigido: `.pulsating-mist` da Galeria passava da largura da tela; `section` ganhou
  `overflow-x: clip` (verificado em index, expositores, ingressos e photo-viewer, 1440px e 390px).
- Hero: "Nos vemos em 2027" reorganizado no padrão do guia (`.hero-info` em `hero.css`: eyebrow, título
  com filete, nota, botão do Instagram; halo escuro sutil atrás do texto; entrada em cascata).
- `photo-viewer.html` redesenhado pelo guia (CSS inline movido para `css/sections/photo-viewer.css`);
  contador "NN / 18", Esc fecha, fechar volta para `index.html#galeria`.
- `assets/estandarte-local.webp`: estandarte da seção Local trocado pelo de letra B ornada (roxo e dourado,
  420px).
- `index.html` + `css/sections/location.css`: seção Local redesenhada (estandarte lavanda
  `assets/estandarte-local.webp` à esquerda, bloco de info sem card, botões Como Chegar/Waze no estilo
  do site, mapa com moldura dourada; empilha no celular).
- `css/sections/contact.css`: seção Expositores mais baixa (padding 60px, header e texto compactos).
- `index.html`: textos dos 3 cards de "Sobre o Festival" reescritos a partir do conceito oficial
  (`docs/drive-brumas25.md`) e das atrações registradas (`docs/imprensa-mencoes.md`):
  "Uma Viagem no Tempo", "Saberes Ancestrais", "Imersão para Toda a Família" (depois renomeado
  para "Uma Imersão Completa", sem a palavra "família", a pedido).
- Seção Expositores redesenhada pelo guia: info (eyebrow, título, descrição, 3 detalhes com ícone,
  botões "Quero Expor em 2027" e "Tirar Dúvidas" no WhatsApp) + foto emoldurada
  (`assets/pictues/brumas_artesaos_medievais_md.webp`, 760px). CSS movido de `contact.css` para o novo
  `css/sections/exhibitors.css`. Itens inclusos (barraca, energia, 2 cadeiras) vêm da chamada de 2026.
- `AGENTS.md`: nova seção "Guia de design" com o método e os estilos da seção Local como padrão do site.
- `css/sections/gallery.css`: emblema B em névoa como overlay sutil da Galeria; o fade lateral das
  fotos passou de faixas sólidas (`::before/::after`) para `mask-image`, para não cobrir o emblema.
- `index.html`: seção `#2027` removida; CTA do hero virou "Acompanhar Novidades" (Instagram, o
  botão que estava na seção 2027); badge "2ª edição 2026 · Obrigado por atravessar as Brumas" removido.
- `css/sections/about.css`: reescrito para os cards (empilham abaixo de 850px).
- `assets/brumas-2027/`: só os 3 medalhões em WebP. O resto do pacote `brumas_2027_web_assets`
  (estandartes, coelho, raposa, folhagens, cards PNG) não está no repo.

### 2026-10-02 — Site em modo pós-evento 2026 / anúncio de 2027
- `index.html`: hero de agradecimento + "Nos vemos em 2027"; seção Ingressos substituída por `#2027`;
  texto de Expositores convidando para 2027; `offers` removido do JSON-LD.
- `js/script.js`: `NAV_LINKS` com `'2027'` no lugar de `'Ingressos'`; removido o handler de contagem
  regressiva/música (quebraria com a data passada).
- `ingressos.html`: formulário de compra trocado por aviso "Vendas Encerradas"; `noindex`.
- `expositores.html`: virou lista de interesse para 2027 (título, textos, botão e modal).
- `expositores-2026.html`: hotsite removido, agora redireciona para `expositores.html`;
  `css/sections/expositores-hotsite.css` apagado (base para 2027 no commit `24bda16`).
- `termos-participantes.html`: links "Comprar Ingressos" → "Voltar ao Site".
- `sitemap.xml`: removidos `ingressos.html` e `expositores-2026.html`.
- Criados `AGENTS.md` e `CLAUDE.md` (que importa este arquivo).
