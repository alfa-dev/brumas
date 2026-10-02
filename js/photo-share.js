// Compartilhamento das fotos da galeria (photo-viewer.html).
//
// Como funciona cada canal:
// - Stories/Instagram: o Instagram não aceita links de compartilhamento vindos de sites. O caminho que
//   funciona é a folha de compartilhamento nativa do celular (Web Share API com arquivo), onde aparecem
//   "Instagram Stories", "Feed", "Direct", WhatsApp etc. A imagem 1080x1920 (moldura, título e marca do
//   Brumas) é pré-gerada por scripts/gerar-compartilhamento.py. No computador, a imagem é baixada.
// - WhatsApp/Facebook: por link. O link aponta para galeria/foto-N.html, que tem a prévia (og:image) da
//   própria foto e redireciona para o visualizador (gerado por scripts/gerar-compartilhamento.py).
(function () {
  const BASE = 'https://brumasfestival.com.br';

  const dialog = document.getElementById('share-dialog');
  const openButton = document.getElementById('share-button');
  const preview = document.getElementById('share-preview');
  const previewBox = preview.closest('.pv-share-preview');
  const hint = document.getElementById('share-hint');
  const toast = document.getElementById('share-toast');
  const nativeButton = dialog.querySelector('[data-share="native"]');
  // "Mais opções" só onde há folha nativa útil (celular/tablet); no computador ela é limitada
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (navigator.share && isTouch) nativeButton.hidden = false;

  let current = null;   // { id, file, url }  — imagem pronta para a foto atual
  let building = null;  // promessa da geração em andamento

  const photoId = () => parseInt(new URLSearchParams(location.search).get('id'), 10);
  const getPhoto = () => PHOTOS.find(p => p.id === photoId());
  const cleanTitle = t => t.replace(/^[.\s]+|[.\s]+$/g, '');
  const shareLink = id => `${BASE}/galeria/foto-${id}.html`;
  const slug = t => cleanTitle(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  // Imagem de Stories pré-gerada (scripts/gerar-compartilhamento.py → assets/stories/foto-N.jpg).
  // Ao abrir o painel buscamos o arquivo como blob, para o share do celular acontecer ainda dentro do
  // clique (o Safari exige). Aberto via file://, o fetch não funciona: aí só mostramos e baixamos/abrimos.
  const storySrc = id => `assets/stories/foto-${id}.jpg`;
  const isFile = location.protocol === 'file:';

  function prepare() {
    const photo = getPhoto();
    if (!photo) return Promise.resolve(null);
    const id = photo.id;
    preview.src = storySrc(id);
    if (current && current.id === id) return Promise.resolve(current);
    current = { id, file: null };
    if (isFile) return Promise.resolve(current);
    building = fetch(storySrc(id))
      .then(r => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
      .then(blob => {
        if (current && current.id === id) current.file = new File([blob], `brumas-${slug(photo.title)}.jpg`, { type: 'image/jpeg' });
        return current;
      })
      .catch(() => current);
    return building;
  }

  preview.addEventListener('load', () => previewBox.classList.remove('is-loading', 'is-unavailable'));
  preview.addEventListener('error', () => { previewBox.classList.remove('is-loading'); previewBox.classList.add('is-unavailable'); });

  function download(id, title) {
    const a = document.createElement('a');
    a.href = storySrc(id);
    a.download = `brumas-${slug(title)}.jpg`;
    if (isFile) a.target = '_blank'; // file:// não baixa direto: abre a imagem para salvar
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function act(kind) {
    const photo = getPhoto();
    if (!photo) return;
    const title = cleanTitle(photo.title);
    const link = shareLink(photo.id);
    const text = `${title} · Brumas Festival Medieval`;

    if (kind === 'close') return dialog.close();
    if (kind === 'whatsapp') return window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`, '_blank', 'noopener');
    if (kind === 'facebook') return window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank', 'noopener,width=640,height=560');
    if (kind === 'copy') {
      try { await navigator.clipboard.writeText(link); showToast('Link copiado!'); }
      catch (e) { window.prompt('Copie o link:', link); }
      return;
    }
    if (kind === 'native') {
      try { await navigator.share({ title: text, text, url: link }); } catch (e) { /* cancelado */ }
      return;
    }

    // Stories: em tela de toque, folha nativa com o arquivo (Instagram Stories/Feed/Direct aparecem lá);
    // no computador, baixa a imagem.
    if (kind === 'stories' && isTouch && current && current.id === photo.id && current.file &&
        navigator.canShare && navigator.canShare({ files: [current.file] })) {
      try {
        await navigator.share({ files: [current.file], title: text, text: `${text}\n${link}` });
      } catch (e) {
        if (e.name !== 'AbortError') { download(photo.id, photo.title); showToast('Imagem salva! Publique nos Stories pelo app.'); }
      }
      return;
    }
    download(photo.id, photo.title);
    if (isFile) return showToast('Imagem aberta em nova aba — salve com o botão direito.');
    showToast(kind === 'stories'
      ? (isTouch ? 'Imagem salva! Publique nos Stories pelo app do Instagram.' : 'Imagem salva! Envie ao celular e publique nos Stories.')
      : 'Imagem salva!');
  }

  openButton.addEventListener('click', () => {
    previewBox.classList.add('is-loading');
    dialog.showModal();
    prepare();
  });
  dialog.addEventListener('click', e => {
    const btn = e.target.closest('[data-share]');
    if (btn) return act(btn.dataset.share);
    if (e.target === dialog) dialog.close(); // clique fora do painel
  });

  // Ao trocar de foto com o painel aberto, gera a imagem da nova foto
  ['popstate', 'brumas:photochange'].forEach(ev => window.addEventListener(ev, () => {
    if (dialog.open) { previewBox.classList.add('is-loading'); prepare(); }
  }));
})();
