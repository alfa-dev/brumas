const SpamProtection = {
  // Palavras-chave associadas ao spam observado nos cadastros
  _spamKeywords: [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'binance',
    'wallet', 'transfer', 'deposit', 'withdrawal', 'unclaimed',
    'graph.org', 'recover', 'redeem', 'pending'
  ],

  _urlPattern: /https?:\/\/|www\./i,

  _rateLimitKey: 'brumas_last_submission',
  _rateLimitMs: 5 * 60 * 1000, // 5 minutos

  init() {
    const loadField = document.getElementById('_ltime');
    if (loadField) loadField.value = Date.now();

    const tokenField = document.getElementById('_jsck');
    if (tokenField) {
      const d = new Date();
      tokenField.value = btoa(`brumas_${d.getFullYear()}${d.getMonth()}${d.getDate()}`);
    }
  },

  // Camada 4: bloqueia conteúdo com URLs ou termos de spam conhecidos
  _hasSpamContent(form) {
    const fields = form.querySelectorAll('input[type="text"], textarea');
    for (const field of fields) {
      if (field.id === '_hp') continue;
      const val = field.value.toLowerCase();
      if (this._urlPattern.test(val)) {
        console.warn('[spam] URL detectada em campo de texto');
        return true;
      }
      if (this._spamKeywords.some(kw => val.includes(kw))) {
        console.warn('[spam] palavra-chave de spam detectada:', field.id);
        return true;
      }
    }
    return false;
  },

  // Camada 5: rate limiting — mesmo navegador não pode reenviar em 5 minutos
  _isRateLimited() {
    try {
      const last = parseInt(localStorage.getItem(this._rateLimitKey) || '0');
      if (last > 0 && (Date.now() - last) < this._rateLimitMs) {
        console.warn('[spam] rate limit ativo');
        return true;
      }
    } catch (_) {}
    return false;
  },

  // Registra submissão bem-sucedida para o rate limiter
  recordSubmission() {
    try {
      localStorage.setItem(this._rateLimitKey, Date.now().toString());
    } catch (_) {}
  },

  // Retorna true se a submissão parece spam
  isSpam(form) {
    const data = new FormData(form);

    // Camada 1: honeypot
    const hp = (data.get('_hp') || '').trim();
    if (hp !== '') {
      console.warn('[spam] honeypot preenchido');
      return true;
    }

    // Camada 2: submissão muito rápida
    const loadTime = parseInt(data.get('_ltime') || '0');
    if (loadTime > 0 && (Date.now() - loadTime) < 3000) {
      console.warn('[spam] submissão muito rápida');
      return true;
    }

    // Camada 3: token JS ausente ou inválido
    const d = new Date();
    const expected = btoa(`brumas_${d.getFullYear()}${d.getMonth()}${d.getDate()}`);
    if (data.get('_jsck') !== expected) {
      console.warn('[spam] token JS inválido');
      return true;
    }

    // Camada 4: conteúdo com URLs ou termos de spam
    if (this._hasSpamContent(form)) return true;

    // Camada 5: rate limiting
    if (this._isRateLimited()) return true;

    return false;
  }
};

// reCAPTCHA v3 (requer chave do Google — descomentar quando disponível):
// <script src="https://www.google.com/recaptcha/api.js?render=SITE_KEY"></script>
// grecaptcha.ready(() => grecaptcha.execute('SITE_KEY', {action: 'submit'}).then(token => { ... }));

document.addEventListener('DOMContentLoaded', () => SpamProtection.init());
