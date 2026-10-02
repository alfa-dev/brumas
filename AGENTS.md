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
| `index.html` | Home (hero, Sobre, Galeria, Expositores, 2027, Contato, Local, Organizadores) |
| `ingressos.html` | Hoje: aviso de vendas encerradas. Em edição ativa: formulário de compra |
| `expositores.html` | Formulário de expositores (hoje: lista de interesse 2027) → Google Apps Script |
| `expositores-2026.html` | Redireciona para `expositores.html` (o hotsite de urgência 2026 foi removido) |
| `pagamento-confirmado.html` | Retorno do checkout (ainda cita 19/09/2026) |
| `photo-viewer.html` | Visualizador das fotos da galeria (`?id=`) |
| `termos-participantes.html`, `termos-expositores.html` | Termos (fonte em `termos_*.md`) |
| `_expositores.html` | Arquivo antigo; ignorado pelo hook de cache busting |
| `js/script.js` | **Dados do site**: `PRICES`, `TICKET_SALES_URL`, `TICKETS`, `NAV_LINKS`, `PHOTOS`, `CONTACT`, `SOCIAL_LINKS`, `ATTRACTIONS` |
| `js/components.js` | Web components: header, footer, tickets, contato, redes, galeria |
| `js/ticket-form.js`, `js/merchant-form.js`, `js/form-handler.js`, `js/spam-protection.js` | Lógica dos formulários |
| `css/styles.css` | Importa base, layout, componentes, seções e decorativos |
| `assets/pictues/` | Fotos da galeria (`nome.webp` + `nome_sm.webp`) — sim, a pasta é "pictues" |
| `docs/` | Referências internas (conteúdo do Drive, menções na imprensa) |
| `sitemap.xml`, `robots.txt` | SEO técnico |

## Convenções

- **Menu:** `NAV_LINKS` em `js/script.js`. O link é gerado como `index.html#<rótulo sem acento em
  minúsculas>`, então o `id` da seção precisa bater (ex.: `'2027'` → `<section id="2027">`).
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

## Estado atual — pós-evento 2026 (atualizado em 2026-10-02)

A 2ª edição ("No limiar das Brumas") aconteceu em **19/09/2026** no Caminho das Montanhas,
Rua Francisco Portela, 115 – Cantagalo, Guapimirim/RJ. O site está em **modo pós-evento**,
anunciando que haverá a **3ª edição em 2027** (data ainda não definida).

- Hero: "2ª edição 2026 · Obrigado por atravessar as Brumas" / "Nos vemos em 2027" / CTA → `#2027`.
- Seção `#2027` ("Brumas 2027") substituiu a seção de Ingressos na home; CTA para o Instagram.
  Sem `medieval-divider` abaixo do título (removido a pedido).
- Ingressos: vendas encerradas (`ingressos.html` com aviso, `noindex`, fora do sitemap).
- Expositores: formulário funciona como **lista de interesse 2027**.
- Galeria: ainda com fotos de **2025** (legenda "Brumas Festival 2025").

## Pendências

- [ ] **Fotos de 2026:** incluir na galeria (`PHOTOS`) e atualizar a legenda da seção Galeria.
- [ ] **Termos de expositores:** o formulário de interesse exige aceitar termos que dizem "Válido
      para a edição de 19 de setembro de 2026". Revisar para 2027.
- [ ] **Checkout externo** (`brumas-front-end.vercel.app/ingressos.html`): se não for gerado a
      partir deste repositório, fechar as vendas lá também.
- [ ] **Data da edição 2027:** quando definida, seguir o checklist abaixo.
- [ ] Bug antigo nos dados: `TICKETS[0].description` diz "entrada do dia 25.07.26" (data errada) —
      corrigir ao reabrir as vendas.

## Checklist — reabrir o site para a edição 2027

1. **Hero** (`index.html`): edição/tema no `.edition-badge`, data no `<time class="event-date">`
   (com `datetime`), horário em `.event-time`, CTA "Garantir Ingresso" → `TICKET_SALES_URL`.
2. **Ingressos:** restaurar a seção `#ingressos` na home e o formulário em `ingressos.html`
   (recuperar do git: `git show 24bda16:ingressos.html` e `git show 24bda16:index.html`).
   Atualizar `PRICES`/`TICKETS` em `js/script.js`; trocar `'2027'` por `'Ingressos'` em `NAV_LINKS`
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
