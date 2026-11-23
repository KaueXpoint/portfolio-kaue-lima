  window.getCharHTML = function (ch) {
    if (ch === ' ') return '&nbsp;';
    if (ch === '🡲' || ch === '🡺') return '<svg style="width: 1.25em; height: 1.25em; vertical-align: -0.25em;" viewBox="0 0 84 85" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11 38H54L37 21H51L73 43L51 65H37L54 48H11Z"/></svg>';
    if (ch === '🡼') return '<svg style="width: 1.25em; height: 1.25em; vertical-align: -0.25em;" viewBox="0 0 84 85" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-135 42 42.5)"><path d="M11 38H54L37 21H51L73 43L51 65H37L54 48H11Z"/></g></svg>';
    if (ch === '🞣') return '<svg style="width: 0.9em; height: 0.9em; vertical-align: -0.1em; transform: translateY(-0.1em);" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"/></svg>';
    return ch;
  };


(function () {
  const p = window.PORTFOLIO;
  const fullName = [p.nome, p.sobrenome].filter(Boolean).join(' ');
  const onContact = !!document.getElementById('contact-main');
  const personalLinks = p.redes.filter(link => link.nome && link.url);
  const fallbackLinks = [
    { nome: 'Projetos', url: 'works/' },
    { nome: 'Sobre', url: 'info/' }
  ];
  const contactLinks = [
    ...(p.email ? [{ nome: 'E-mail', url: 'mailto:' + p.email }] : []),
    ...personalLinks
  ];

  function create(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach(el => { el.textContent = text; });
  }

  function setRichText(selector, html) {
    document.querySelectorAll(selector).forEach(el => { el.innerHTML = html; });
  }

  function linkElement(link) {
    const a = create('a', '', link.nome);
    a.href = link.url;
    a.setAttribute('aria-label', link.nome);
    if (/^https?:/.test(link.url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  function renderNav(el, links, letterAttr) {
    el.replaceChildren();
    links.forEach((link, index) => {
      if (el.classList.contains('hero-bar-center') && index) {
        const sep = create('span', 'sep', '/');
        sep.setAttribute('aria-hidden', 'true');
        el.append(sep);
      }
      const a = linkElement(link);
      a.className = 'chr-hover';
      a.textContent = '';
      a.setAttribute(letterAttr, link.nome);
      el.append(a);
    });
    el.setAttribute('aria-label', personalLinks.length ? 'Contato profissional' : 'Referências');
  }

  const primaryName = Array.from(p.nome);
  setText('#preloader-logo, .footer-name-luke .first-letter', primaryName[0] || '');
  setText('#preloader-luke', primaryName.slice(1).join(''));
  setText('#preloader-baffait', p.sobrenome ? ' ' + p.sobrenome : '');
  setText('.footer-name-baffait', p.sobrenome);
  const footerName = document.querySelector('.footer-name-luke');
  if (footerName) footerName.replaceChildren(create('span','first-letter',primaryName[0]), primaryName.slice(1).join(''));

  setText('#info-main .info-name, [data-profile="name"]', fullName);
  setText('[data-profile="role"]', p.profissao);
  setText('[data-profile="bio"]', p.bio);
  setText('#reveal-phrase', p.frase);
  setRichText('#hero-tagline', p.chamada);
  setRichText('#about-text', p.apresentacao);
  setText('[data-profile="location"]', p.cidade || 'Local não informado');
  setText('[data-profile="status"]', p.disponibilidade || 'A consultar');
  setText('[data-profile="response"]', p.email ? 'Por e-mail' : 'Ainda não divulgado');
  setText('[data-profile="contactText"]', contactLinks.length ? 'Para conversar sobre uma ideia ou uma colaboração, escolha um dos canais abaixo.' : 'Os canais de contato desta edição ainda não foram divulgados. Enquanto isso, explore a seleção de projetos e referências.');
  document.querySelectorAll('[data-profile="portrait"]').forEach(img => {
    img.src = p.imagem;
    img.alt = p.imagemLegenda;
  });
  setText('[data-profile="photoCredit"]', p.imagemLegenda);
  if (p.imagemLegenda) document.querySelectorAll('[data-profile="photoCredit"]').forEach(el => el.hidden = false);
  document.querySelectorAll('[data-links]').forEach(el => {
    const links = personalLinks.length ? personalLinks : p.referencias;
    renderNav(el, links, el.dataset.links);
  });
  document.querySelectorAll('[data-email-link]').forEach(el => {
    const label = p.email || (onContact ? 'Explorar projetos' : 'Página de contato');
    el.href = p.email ? 'mailto:' + p.email : onContact ? 'works/' : 'contact/';
    el.setAttribute('aria-label', label);
    const attr = el.dataset.emailLink;
    if (attr) el.setAttribute(attr, label);
    else el.textContent = label;
  });
  const shortcutList = document.querySelector('[data-shortcuts]');
  if (shortcutList) {
    shortcutList.replaceChildren();
    (contactLinks.length ? contactLinks : fallbackLinks).forEach(link => {
      const li = create('li');
      const a = linkElement(link);
      a.className = 'contact-link';
      li.append(a);
      shortcutList.append(li);
    });
  }

  const featured = p.projetos.filter(project => project.destaque !== false);
  const list = document.getElementById('projects-list');
  const gallery = document.getElementById('circle-gallery-pin');
  if (list && gallery) {
    list.replaceChildren();
    const phrase = gallery.querySelector('.cg-phrase');
    gallery.replaceChildren();
    featured.forEach(project => {
      const item = create('div', 'proj-item', project.title);
      item.dataset.id = project.id;
      item.dataset.img = project.cover;
      item.dataset.date = project.data || project.year;
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Ver ' + project.title);
      list.append(item);
      const img = create('img', 'cg-img');
      img.src = project.cover;
      img.alt = project.title + (project.autor ? ' · ' + project.autor : '');
      img.width = 1200;
      img.height = 900;
      gallery.append(img);
    });
    gallery.append(phrase);
    if (featured.length) document.getElementById('proj-cover').src = featured[0].cover;
  }

  const skillGroups = document.getElementById('skills-right');
  const infoSkills = document.querySelector('.info-skills');
  if (skillGroups || infoSkills) {
    skillGroups?.replaceChildren();
    infoSkills?.replaceChildren();
    p.areas.forEach((area, index) => {
      const ul = create('ul');
      area.itens.forEach(item => ul.append(create('li', '', item)));
      if (skillGroups) {
        const group = create('div', 'skill-group' + (index === 0 ? ' open' : ''));
        const header = create('div', 'skill-header');
        header.setAttribute('role', 'button');
        header.tabIndex = 0;
        header.setAttribute('aria-expanded', String(index === 0));
        header.append(create('span', 'skill-header-title', area.titulo), create('span', 'skill-header-icon'));
        const body = create('div', 'skill-body');
        ul.className = 'skill-body-inner';
        body.append(ul);
        group.append(header, body);
        skillGroups.append(group);
      }
      if (infoSkills && index < 4) {
        const column = create('div', 'skill-col');
        column.append(create('div', 'skill-col-title', area.titulo), ul);
        infoSkills.append(column);
      }
    });
  }

  const credits = document.getElementById('awards-list');
  if (credits) {
    setText('.awards-title', p.tituloCreditos);
    credits.replaceChildren();
    p.creditos.forEach(([area, author, work, date, image]) => {
      const row = create('div', 'award-item');
      row.dataset.cursorImg = image || p.imagem;
      row.append(create('div', 'award-org', area), create('div', 'award-site', author),
        create('div', 'award-prize', work), create('div', 'award-date', date));
      credits.append(row);
    });
  }

  document.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const button = event.target.closest('[role="button"]');
    if (button && !['A', 'BUTTON'].includes(button.tagName)) {
      event.preventDefault();
      button.click();
    }
  });
})();
