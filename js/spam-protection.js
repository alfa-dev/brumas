const SpamProtection = {
  init() {
    // Camada 2: registra o momento em que a página foi carregada
    const loadField = document.getElementById('_ltime');
    if (loadField) loadField.value = Date.now();

    // Camada 3: token que só existe se o JS foi executado
    const tokenField = document.getElementById('_jsck');
    if (tokenField) {
      const d = new Date();
      tokenField.value = btoa(`brumas_${d.getFullYear()}${d.getMonth()}${d.getDate()}`);
    }
  },

  // Retorna true se a submissão parece spam
  isSpam(form) {
    const data = new FormData(form);

    // Camada 1: honeypot — bots preenchem campos ocultos, humanos não
    const hp = (data.get('_hp') || '').trim();
    if (hp !== '') {
      console.warn('[spam] honeypot preenchido');
      return true;
    }

    // Camada 2: tempo — submissão em menos de 3s indica automação
    const loadTime = parseInt(data.get('_ltime') || '0');
    if (loadTime > 0 && (Date.now() - loadTime) < 3000) {
      console.warn('[spam] submissão muito rápida');
      return true;
    }

    // Camada 3: token JS — bots sem JS não conseguem calcular o valor correto
    const d = new Date();
    const expected = btoa(`brumas_${d.getFullYear()}${d.getMonth()}${d.getDate()}`);
    if (data.get('_jsck') !== expected) {
      console.warn('[spam] token JS ausente ou inválido');
      return true;
    }

    return false;
  }
};

document.addEventListener('DOMContentLoaded', () => SpamProtection.init());
