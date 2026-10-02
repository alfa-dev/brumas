#!/usr/bin/env python3
"""Gera, a partir de PHOTOS em js/script.js:
- galeria/foto-N.html + assets/og/foto-N.jpg (1200x630): página com a prévia da foto para WhatsApp/Facebook;
- assets/stories/foto-N.jpg (1080x1920): imagem pronta para Instagram Stories (usada pelo js/photo-share.js).

Por que existe: WhatsApp/Facebook/X montam a prévia do link lendo as metatags Open Graph do HTML, sem
rodar JavaScript. O visualizador (photo-viewer.html?id=N) é uma página só para todas as fotos, então a
prévia seria sempre a mesma. Cada foto ganha uma página estática com og:image própria que, no navegador,
redireciona na hora para o visualizador.

Uso (rodar de novo sempre que PHOTOS mudar):  python3 scripts/gerar-compartilhamento.py
Requer ImageMagick (`magick`).
"""
import html, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://brumasfestival.com.br'

src = open(os.path.join(ROOT, 'js/script.js'), encoding='utf-8').read()
block = src[src.index('const PHOTOS = ['):]
block = block[:block.index('];')]
photos = re.findall(r"id:\s*(\d+),\s*src:\s*'([^']+)',\s*alt:\s*'([^']*)',\s*title:\s*'([^']*)'", block)

os.makedirs(os.path.join(ROOT, 'galeria'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'assets/og'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'assets/stories'), exist_ok=True)
FONTS = os.path.join(ROOT, 'scripts/fonts')
FONT_TITLE = os.path.join(FONTS, 'MedievalSharp.ttf')
FONT_CAPS = os.path.join(FONTS, 'Cinzel.ttf')
FONT_ITALIC = os.path.join(FONTS, 'GentiumBookPlus-Italic.ttf')

def story_jpg(src, title, out):
    """Imagem 9:16 para Stories: nebulosa, logo, foto em moldura dourada dupla, título e assinatura."""
    W, H = 1080, 1920
    tmp_photo = out + '.photo.png'
    # foto redimensionada para caber em 900x1080
    subprocess.run(['magick', os.path.join(ROOT, src), '-auto-orient', '-resize', '900x1080', tmp_photo], check=True)
    pw, ph = map(int, subprocess.run(['magick', 'identify', '-format', '%w %h', tmp_photo],
                                      capture_output=True, text=True, check=True).stdout.split())
    px, py = (W - pw) // 2, 380 + (1080 - ph) // 2
    fx0, fy0, fx1, fy1 = px - 18, py - 18, px + pw + 18, py + ph + 18
    text_top = max(fy1 + 90, 1520)
    cx = W // 2
    diamond = lambda x, y, r: f'polygon {x},{y-r} {x+r},{y} {x},{y+r} {x-r},{y}'
    cmd = [
        'magick', '-size', f'{W}x{H}', 'xc:#12051f',
        # nebulosa + véu
        '(', os.path.join(ROOT, 'assets/nebulosa-roxa.webp'), '-resize', f'{W}x{H}^', '-gravity', 'center',
             '-extent', f'{W}x{H}', '-channel', 'A', '-evaluate', 'multiply', '0.85', '+channel', ')',
        '-gravity', 'northwest', '-composite',
        '(', '-size', f'{W}x{H}', 'gradient:rgba(10,4,20,0.55)-rgba(10,4,20,0.75)', ')', '-composite',
        # logo
        '(', os.path.join(ROOT, 'assets/brumas_logo_share.png'), '-resize', '520x', ')',
        '-gravity', 'north', '-geometry', '+0+120', '-composite', '-gravity', 'northwest',
        # sombra e fundo da moldura
        '(', '-size', f'{W}x{H}', 'xc:none', '-fill', 'rgba(0,0,0,0.65)',
             '-draw', f'rectangle {fx0},{fy0+20} {fx1},{fy1+20}', '-blur', '0x25', ')', '-composite',
        '-fill', '#1a0730', '-draw', f'rectangle {fx0},{fy0} {fx1},{fy1}',
        tmp_photo, '-geometry', f'+{px}+{py}', '-composite',
        # molduras douradas
        '-fill', 'none', '-stroke', '#c8a050', '-strokewidth', '3', '-draw', f'rectangle {fx0},{fy0} {fx1},{fy1}',
        '-stroke', 'rgba(200,160,80,0.45)', '-strokewidth', '2', '-draw', f'rectangle {px-9},{py-9} {px+pw+9},{py+ph+9}',
        '-fill', '#1a0730', '-stroke', '#c8a050', '-strokewidth', '2',
        '-draw', diamond(cx, fy0, 14), '-draw', diamond(cx, fy1, 14),
        '-stroke', 'none',
        # textos
        '-gravity', 'north',
        '-font', FONT_CAPS, '-pointsize', '28', '-kerning', '8', '-fill', '#e3b558',
        '-annotate', f'+0+{text_top - 26}', 'BRUMAS FESTIVAL · 2025',
        '-font', FONT_TITLE, '-pointsize', '84', '-kerning', '0', '-fill', '#ffffff',
        '-annotate', f'+0+{text_top + 22}', title,
        '-fill', '#c8a050', '-draw', f'rectangle {cx-160},{text_top+144} {cx+160},{text_top+146}',
        '-draw', diamond(cx, text_top + 145, 7),
        '-font', FONT_ITALIC, '-pointsize', '34', '-fill', 'rgba(245,245,245,0.85)',
        '-annotate', f'+0+{H - 172}', 'Nos vemos em 2027 · Guapimirim (RJ)',
        '-font', FONT_CAPS, '-pointsize', '30', '-kerning', '6', '-fill', '#e3b558',
        '-annotate', f'+0+{H - 108}', 'BRUMASFESTIVAL.COM.BR',
        '-strip', '-quality', '86', out]
    subprocess.run(cmd, check=True)
    os.remove(tmp_photo)

for pid, path, alt, title in photos:
    title = re.sub(r'^[.\s]+|[.\s]+$', '', title)
    og = f'assets/og/foto-{pid}.jpg'
    # Prévia 1200x630: a própria foto desfocada ao fundo + foto inteira no centro com filete dourado
    subprocess.run([
        'magick', os.path.join(ROOT, path), '-auto-orient',
        '(', '+clone', '-resize', '1200x630^', '-gravity', 'center', '-extent', '1200x630',
             '-blur', '0x22', '-modulate', '70,110', ')',
        '(', '-clone', '0', '-resize', '1100x560', '-bordercolor', '#c8a050', '-border', '3', ')',
        '-delete', '0', '-gravity', 'center', '-composite',
        '-strip', '-quality', '78', os.path.join(ROOT, og)], check=True)

    story_jpg(path, title, os.path.join(ROOT, f'assets/stories/foto-{pid}.jpg'))

    t = html.escape(f'{title} · Brumas Festival Medieval')
    d = html.escape(f'{title} na 1ª edição do Brumas Festival Medieval, em Guapimirim (RJ). A 3ª edição chega em 2027.')
    page = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Gerado por scripts/gerar-compartilhamento.py — não editar à mão -->
  <title>{t}</title>
  <meta name="description" content="{d}">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="{BASE}/galeria/foto-{pid}.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Brumas Festival Medieval">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:url" content="{BASE}/galeria/foto-{pid}.html">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:image" content="{BASE}/{og}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{html.escape(alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{t}">
  <meta name="twitter:description" content="{d}">
  <meta name="twitter:image" content="{BASE}/{og}">
  <meta name="theme-color" content="#270d4f">
  <script>location.replace('../photo-viewer.html?id={pid}');</script>
</head>
<body style="background:#080806;color:#f5f5f5;font-family:serif;text-align:center;padding:40px">
  <p><a style="color:#c8a050" href="../photo-viewer.html?id={pid}">Ver “{html.escape(title)}” na galeria do Brumas Festival</a></p>
</body>
</html>
'''
    open(os.path.join(ROOT, f'galeria/foto-{pid}.html'), 'w', encoding='utf-8').write(page)
    print(f'foto-{pid}: {title}')
