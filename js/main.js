(function () {
  'use strict';

  const root = document.documentElement;
  const store = {
    get(key) {
      try { return localStorage.getItem('ophatxera:' + key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem('ophatxera:' + key, value); } catch (e) { /* sem armazenamento: segue sem lembrar */ }
    },
  };

  // ---------- Tema claro / escuro (como no yPOS) ----------
  const themeBtn = document.querySelector('.theme-btn');
  const isDark = () => {
    const t = root.dataset.theme;
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const syncTheme = () => {
    const dark = isDark();
    themeBtn.innerHTML = `<span class="mdi mdi-${dark ? 'white-balance-sunny' : 'weather-night'}" aria-hidden="true"></span>`;
    themeBtn.setAttribute('aria-label', dark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
  };
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('theme', next);
    syncTheme();
  });
  syncTheme();

  // ---------- Menu mobile ----------
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('menu');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = `<span class="mdi mdi-${open ? 'close' : 'menu'}" aria-hidden="true"></span>`;
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ---------- Fundo de pontos que acende à volta do cursor ----------
  const glow = document.querySelector('.dots__glow');
  let frame = 0;
  const moveGlow = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      glow.style.setProperty('--mx', x + 'px');
      glow.style.setProperty('--my', y + 'px');
    });
  };
  window.addEventListener('pointermove', e => moveGlow(e.clientX, e.clientY), {passive: true});
  document.addEventListener('pointerleave', () => moveGlow(-400, -400));

  // ---------- Secção ativa no menu + entrada ao fazer scroll ----------
  if ('IntersectionObserver' in window) {
    const links = new Map([...nav.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(
      entries => entries.forEach(e => {
        const link = links.get(e.target.id);
        if (link && e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }),
      {rootMargin: '-40% 0px -55% 0px'},
    );
    document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

    const reveal = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          reveal.unobserve(e.target);
        }
      }),
      {threshold: 0.08},
    );
    document.querySelectorAll('.sheet:not(.cover-sheet), .kit-item, .product').forEach(el => {
      el.classList.add('reveal');
      reveal.observe(el);
    });
  }

  // ---------- Botões que pré-selecionam o assunto ----------
  const assunto = document.getElementById('assunto');
  document.querySelectorAll('[data-subject]').forEach(el =>
    el.addEventListener('click', () => { assunto.value = el.dataset.subject; }),
  );

  // ---------- Formulário: compõe um e-mail para o endereço certo ----------
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      const ok = f.value.trim() !== '' && f.checkValidity();
      f.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      note.textContent = 'Por favor preencha o nome, um e-mail válido e a mensagem.';
      return;
    }

    const d = Object.fromEntries(new FormData(form));
    const to = d.assunto === 'Suporte técnico' ? 'suporte@ophatxera.com' : 'info@ophatxera.com';
    const body = `${d.mensagem}\n\n—\nNome: ${d.nome}\nE-mail: ${d.email}\nTelefone: ${d.telefone || '-'}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(d.assunto)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'A abrir o seu e-mail… Também pode falar connosco pelo WhatsApp 84 946 0718.';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
