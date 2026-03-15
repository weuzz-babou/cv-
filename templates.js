/**
 * TEMPLATES MODULE — Sen CV
 * 2 templates inspirés du Figma, couleurs noir & or
 */
const Templates = (() => {

  /*  Helpers ─ */
  const h = {
    esc: s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
    period: (s,e,cur) => cur ? `${s} – Présent` : `${s}${e?' – '+e:''}`,
    photo: (src, sz, border) => src
      ? `<img src="${src}" alt="" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;display:block;${border||''}">`
      : `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;${border||''}"><svg viewBox="0 0 24 24" fill="rgba(255,255,255,.35)" width="${sz*.42}px"><path d="M12 12c2.67 0 4.8-2.13 4.8-4.8S14.67 2.4 12 2.4 7.2 4.53 7.2 7.2 9.33 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>`,
    photoGray: (src, sz) => src
      ? `<img src="${src}" alt="" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;display:block;">`
      : `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:#d8d0c4;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg viewBox="0 0 24 24" fill="#a09080" width="${sz*.42}px"><path d="M12 12c2.67 0 4.8-2.13 4.8-4.8S14.67 2.4 12 2.4 7.2 4.53 7.2 7.2 9.33 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>`,
    bar: (level, color, bg) => {
      const pct = (parseInt(level)||3)*20;
      return `<div style="height:3px;background:${bg||'rgba(255,255,255,.12)'};border-radius:2px;overflow:hidden;margin-top:4px"><div style="width:${pct}%;height:100%;background:${color};border-radius:2px"></div></div>`;
    },
    ico: {
      phone: `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02L6.6 10.8z"/></svg>`,
      email: `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
      loc:   `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
      link:  `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>`,
    },
  };

  /*  TEMPLATE 1 — SIDEBAR SOMBRE
     Sidebar noir/or, partie droite blanche
     Inspiré du modèle Figma 1 */
  const sidebar = cv => {
    const p = cv.personal;
    const OR = '#c9a84c';
    const OR2 = '#b8923e';
    const SB = '#111318';

    const sbSection = (titre, contenu) => `
    <div style="margin-bottom:20px">
      <div style="font-size:6pt;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:${OR};margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid rgba(201,168,76,.2)">${titre}</div>
      ${contenu}
    </div>`;

    const contactLine = (ico, val) => val
      ? `<div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;font-size:7.5pt;color:#bbb;line-height:1.4;word-break:break-all"><span style="color:${OR};flex-shrink:0;margin-top:1px">${ico}</span><span>${h.esc(val)}</span></div>`
      : '';

    const secTitle = (ico, label) => `
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:12px">
      <span style="color:${OR2}">${ico}</span>
      <span style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#1a1a1a">${label}</span>
    </div>
    <div style="border-bottom:2px solid ${OR};margin-bottom:14px"></div>`;

    return `
<div class="cv-root" style="display:grid;grid-template-columns:195px 1fr;min-height:297mm;font-family:'Lato',sans-serif;font-size:9pt;color:#1a1a1a;background:#fff">

  <!-- SIDEBAR NOIR -->
  <div style="background:${SB};padding:30px 16px;display:flex;flex-direction:column">

    <!-- Photo + identité -->
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:24px">
      <div style="border:3px solid ${OR};border-radius:50%;padding:3px;margin-bottom:14px">
        ${h.photo(p.photo, 90, '')}
      </div>
      <div style="font-size:13pt;font-weight:700;color:#fff;line-height:1.2;letter-spacing:.01em">${h.esc(p.firstName)}<br>${h.esc(p.lastName)}</div>
      <div style="font-size:6.5pt;color:${OR};text-transform:uppercase;letter-spacing:.13em;margin-top:6px;font-weight:600;line-height:1.4">${h.esc(p.title)}</div>
    </div>

    <!-- Contact -->
    ${(p.email||p.phone||p.city||p.linkedin||p.website) ? sbSection('Contact', `
      ${contactLine(h.ico.phone, p.phone)}
      ${contactLine(h.ico.email, p.email)}
      ${contactLine(h.ico.loc, [p.address,p.city].filter(Boolean).join(', '))}
      ${contactLine(h.ico.link, p.linkedin)}
    `) : ''}

    <!-- Compétences -->
    ${cv.skills.length ? sbSection('Compétences', cv.skills.map(s => `
      <div style="margin-bottom:10px">
        <div style="font-size:7.5pt;color:#ccc;font-weight:500;margin-bottom:3px">${h.esc(s.name)}</div>
        ${h.bar(s.level, OR)}
      </div>`).join('')) : ''}

    <!-- Langues -->
    ${cv.languages.length ? sbSection('Langues', cv.languages.map(l => `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:7.5pt;margin-bottom:8px">
        <span style="color:#ccc;font-weight:500">${h.esc(l.name)}</span>
        <span style="color:rgba(201,168,76,.65);font-size:6.5pt;font-style:italic">${h.esc(l.level)}</span>
      </div>`).join('')) : ''}

    <!-- Intérêts -->
    ${cv.interests.length ? sbSection('Intérêts', `
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${cv.interests.map(i => `<span style="font-size:6.5pt;padding:3px 8px;border:1px solid rgba(201,168,76,.3);border-radius:3px;color:#bbb">${h.esc(i.name)}</span>`).join('')}
      </div>`) : ''}

    <!-- Certifications -->
    ${cv.certifications.length ? sbSection('Certifications', cv.certifications.map(c => `
      <div style="margin-bottom:7px">
        <div style="font-size:7.5pt;font-weight:700;color:#eee">${h.esc(c.name)}</div>
        <div style="font-size:6.5pt;color:rgba(201,168,76,.6);margin-top:1px">${[c.issuer,c.year].filter(Boolean).map(h.esc).join(' · ')}</div>
      </div>`).join('')) : ''}

  </div>

  <!-- CONTENU PRINCIPAL BLANC -->
  <div style="padding:32px 26px">

    <!-- Profil -->
    ${p.summary ? `
    <div style="margin-bottom:22px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`, 'Profil')}
      <p style="font-size:8.5pt;color:#444;line-height:1.7">${h.esc(p.summary)}</p>
    </div>` : ''}

    <!-- Expériences -->
    ${cv.experience.length ? `
    <div style="margin-bottom:22px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`, 'Expérience Professionnelle')}
      ${cv.experience.map(e => `
      <div style="margin-bottom:16px;padding-left:14px;border-left:2px solid ${OR}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div>
            <div style="font-size:9.5pt;font-weight:700;color:#111">${h.esc(e.position)}</div>
            <div style="font-size:8pt;color:${OR2};margin-top:2px;font-weight:600">${h.esc(e.company)}${e.location?` · ${h.esc(e.location)}`:''}</div>
          </div>
          <div style="font-size:7pt;color:#888;white-space:nowrap;flex-shrink:0;font-style:italic">${h.period(e.startDate,e.endDate,e.current)}</div>
        </div>
        ${e.description ? `<div style="font-size:7.5pt;color:#555;margin-top:5px;line-height:1.65">${h.esc(e.description).split('\n').map(l=>`<div>• ${l}</div>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    <!-- Formation -->
    ${cv.education.length ? `
    <div style="margin-bottom:22px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`, 'Formation')}
      ${cv.education.map(e => `
      <div style="margin-bottom:13px">
        <div style="font-size:9pt;font-weight:700;color:#111">${h.esc(e.degree)}</div>
        <div style="font-size:8pt;color:${OR2};font-weight:600;margin-top:1px">${h.esc(e.institution)}${e.field?` · ${h.esc(e.field)}`:''}</div>
        <div style="font-size:7pt;color:#888;margin-top:1px">${h.period(e.startYear,e.endYear,false)}</div>
        ${e.description ? `<div style="font-size:7.5pt;color:#555;line-height:1.5;margin-top:3px">${h.esc(e.description)}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

  </div>
</div>`;
  };

  /*  TEMPLATE 2 — EN-TÊTE PLEIN
     En-tête noir/or avec photo, corps blanc avec sections
     Badges de compétences par catégorie
     Inspiré du modèle Figma 2 */
  const banner = cv => {
    const p = cv.personal;
    const OR = '#c9a84c';
    const OR2 = '#b8923e';

    const secTitle = (ico, label) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="color:#555">${ico}</span>
        <span style="font-family:'Lato',sans-serif;font-size:13pt;font-weight:700;color:#111">${label}</span>
      </div>
      <div style="height:2px;background:linear-gradient(to right,${OR},${OR2},rgba(184,146,62,.2));border-radius:1px"></div>
    </div>`;

    const contactItem = (ico, val) => val
      ? `<div style="display:flex;align-items:center;gap:6px;font-size:7.5pt;color:rgba(255,255,255,.85)"><span style="opacity:.75">${ico}</span><span>${h.esc(val)}</span></div>`
      : '';

    // Grouper les compétences par catégorie
    const cats = {};
    cv.skills.forEach(s => {
      const c = s.category||'Autres';
      if(!cats[c]) cats[c]=[];
      cats[c].push(s);
    });

    return `
<div class="cv-root" style="min-height:297mm;font-family:'Lato',sans-serif;font-size:9pt;color:#1a1a1a;background:#fff">

  <!-- EN-TETE NOIR / OR -->
  <div style="background:#0f0f0f;padding:28px 32px;display:flex;align-items:center;gap:22px">
    ${h.photo(p.photo, 90, 'border:3px solid '+OR+';flex-shrink:0')}
    <div style="flex:1">
      <div style="font-size:20pt;font-weight:700;color:#fff;line-height:1.1;letter-spacing:.01em">${h.esc(p.firstName)} ${h.esc(p.lastName)}</div>
      <div style="font-size:10pt;color:${OR};font-weight:500;margin-top:4px;margin-bottom:14px">${h.esc(p.title)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 24px">
        ${contactItem(h.ico.email, p.email)}
        ${contactItem(h.ico.phone, p.phone)}
        ${contactItem(h.ico.loc, [p.address,p.city].filter(Boolean).join(', '))}
        ${contactItem(h.ico.link, p.linkedin)}
      </div>
    </div>
  </div>

  <!-- CORPS -->
  <div style="padding:28px 32px">

    <!-- À propos -->
    ${p.summary ? `
    <div style="margin-bottom:24px">
      <div style="font-family:'Lato',sans-serif;font-size:13pt;font-weight:700;color:#111;margin-bottom:6px">À propos</div>
      <div style="height:2px;background:linear-gradient(to right,${OR},${OR2},rgba(184,146,62,.2));border-radius:1px;margin-bottom:12px"></div>
      <p style="font-size:8.5pt;color:#444;line-height:1.75">${h.esc(p.summary)}</p>
    </div>` : ''}

    <!-- Expériences -->
    ${cv.experience.length ? `
    <div style="margin-bottom:24px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`, 'Expérience professionnelle')}
      ${cv.experience.map(e => `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div>
            <div style="font-size:10pt;font-weight:700;color:#111">${h.esc(e.position)}</div>
            <div style="font-size:8pt;color:${OR2};margin-top:2px;font-weight:600">${h.esc(e.company)}${e.location?` · ${h.esc(e.location)}`:''}</div>
          </div>
          <div style="font-size:7.5pt;color:#888;white-space:nowrap;flex-shrink:0">${h.period(e.startDate,e.endDate,e.current)}</div>
        </div>
        ${e.description ? `
        <ul style="margin:6px 0 0 16px;padding:0">
          ${h.esc(e.description).split('\n').filter(l=>l.trim()).map(l=>`<li style="font-size:7.5pt;color:#444;line-height:1.65;margin-bottom:2px">${l}</li>`).join('')}
        </ul>` : ''}
      </div>`).join('')}
    </div>` : ''}

    <!-- Formation -->
    ${cv.education.length ? `
    <div style="margin-bottom:24px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`, 'Formation')}
      ${cv.education.map(e => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:14px">
        <div>
          <div style="font-size:9.5pt;font-weight:700;color:#111">${h.esc(e.degree)}</div>
          <div style="font-size:8pt;color:${OR2};font-weight:600;margin-top:1px">${h.esc(e.institution)}${e.field?` · ${h.esc(e.field)}`:''}</div>
          ${e.description ? `<div style="font-size:7.5pt;color:#555;margin-top:2px">${h.esc(e.description)}</div>` : ''}
        </div>
        <div style="font-size:7.5pt;color:#888;white-space:nowrap;flex-shrink:0">${h.period(e.startYear,e.endYear,false)}</div>
      </div>`).join('')}
    </div>` : ''}

    <!-- Compétences par catégorie (style badges) -->
    ${cv.skills.length ? `
    <div style="margin-bottom:24px">
      ${secTitle(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, 'Compétences')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${Object.entries(cats).map(([cat,skills]) => `
        <div>
          <div style="font-size:7.5pt;font-weight:700;color:#333;margin-bottom:7px">${h.esc(cat)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${skills.map(s => `<span style="font-size:7pt;padding:3px 9px;background:#f5f0e8;border:1px solid #e8d8a8;border-radius:12px;color:#6b5a30;font-weight:500">${h.esc(s.name)}</span>`).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Langues + Intérêts + Certifications en grille -->
    ${(cv.languages.length||cv.interests.length||cv.certifications.length) ? `
    <div style="display:grid;grid-template-columns:${[cv.languages.length,cv.interests.length,cv.certifications.length].filter(Boolean).length > 1 ? '1fr 1fr' : '1fr'};gap:20px">

      ${cv.languages.length ? `
      <div>
        <div style="font-size:9pt;font-weight:700;color:#111;margin-bottom:6px">Langues</div>
        <div style="height:2px;background:linear-gradient(to right,${OR},rgba(184,146,62,.2));border-radius:1px;margin-bottom:10px"></div>
        ${cv.languages.map(l => `
        <div style="display:flex;justify-content:space-between;font-size:8pt;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid #f0e8d8">
          <span style="font-weight:600;color:#222">${h.esc(l.name)}</span>
          <span style="color:#888;font-style:italic">${h.esc(l.level)}</span>
        </div>`).join('')}
      </div>` : ''}

      ${cv.interests.length ? `
      <div>
        <div style="font-size:9pt;font-weight:700;color:#111;margin-bottom:6px">Intérêts</div>
        <div style="height:2px;background:linear-gradient(to right,${OR},rgba(184,146,62,.2));border-radius:1px;margin-bottom:10px"></div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${cv.interests.map(i => `<span style="font-size:7pt;padding:3px 9px;background:#f5f0e8;border:1px solid #e8d8a8;border-radius:12px;color:#6b5a30">${h.esc(i.name)}</span>`).join('')}
        </div>
      </div>` : ''}

      ${cv.certifications.length ? `
      <div>
        <div style="font-size:9pt;font-weight:700;color:#111;margin-bottom:6px">Certifications</div>
        <div style="height:2px;background:linear-gradient(to right,${OR},rgba(184,146,62,.2));border-radius:1px;margin-bottom:10px"></div>
        ${cv.certifications.map(c => `
        <div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:7px">
          <div style="width:6px;height:6px;border-radius:50%;background:${OR};margin-top:4px;flex-shrink:0"></div>
          <div>
            <div style="font-size:8pt;font-weight:600;color:#222">${h.esc(c.name)}</div>
            <div style="font-size:7pt;color:#888">${[c.issuer,c.year].filter(Boolean).map(h.esc).join(' · ')}</div>
          </div>
        </div>`).join('')}
      </div>` : ''}

    </div>` : ''}

  </div>
</div>`;
  };

  /*  Registre ─ */
  const registry = { sidebar, banner };

  const META = [
    { id:'sidebar', name:'Sidebar Sombre', desc:'Sidebar noir & or, barres de compétences' },
    { id:'banner',  name:'En-tête Plein',  desc:'Bandeau noir & or, badges de compétences' },
  ];

  return {
    render: cv => (registry[cv.template] || registry.sidebar)(cv),
    list:   ()  => META,
  };
})();