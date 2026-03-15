/**
 * UI MODULE — Sen CV
 * Gestion complète de l'interface : modales, listes, preview, sidebar CVs
 */
const UI = (() => {

  let _uid = null;   // ID utilisateur courant
  let _cvId = null;  // ID CV courant

  /*  Accès CV courant  */
  const cv = () => DB.CVs.get(_uid, _cvId);
  const user = () => DB.Users.getById(_uid);

  /*  Mise à jour champ CV ─ */
  const updateCV = (field, value) => {
    DB.CVs.updateField(_uid, _cvId, field, value);
    render();
    autosaveFlash();
  };

  /*  Preview temps réel  */
  const render = () => {
    const data = cv();
    if (!data) return;
    const out = document.getElementById('cv-output');
    if (!out) return;
    out.innerHTML = Templates.render(data);
    scalePreview();
  };

  const scalePreview = () => {
    const wrap  = document.getElementById('pv-wrap');
    const inner = document.getElementById('pv-inner');
    if (!wrap || !inner) return;
    const available = wrap.clientWidth - 24;
    const cvWidth   = 794; // ~A4 px
    const scale     = Math.min(1, available / cvWidth);
    inner.style.transform = `scale(${scale})`;
    inner.style.height    = `${inner.scrollHeight * scale}px`;
    inner.style.marginBottom = '0';
  };

  /*  Flash autosave  */
  const autosaveFlash = () => {
    const el = document.getElementById('autosave-indicator');
    if (!el) return;
    el.classList.add('saved');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('saved'), 2000);
  };

  /*  Bind formulaire Profil  */
  const bindPersonalForm = () => {
    const data = cv();
    if (!data) return;
    const fields = ['firstName','lastName','title','email','phone','address','city','linkedin','website','summary'];
    fields.forEach(k => {
      const el = document.getElementById(`p-${k}`);
      if (!el) return;
      el.value = data.personal[k] || '';
      el.oninput = () => {
        const p = cv().personal;
        p[k] = el.value;
        DB.CVs.updateField(_uid, _cvId, 'personal', p);
        render();
        autosaveFlash();
        if (['email','phone'].includes(k)) Validation.display.clearField(el);
      };
      if (k === 'email') el.onblur = () => {
        if (el.value && !Validation.rules.email(el.value)) el.classList.add('inp-error');
        else el.classList.remove('inp-error');
      };
      if (k === 'phone') el.onblur = () => {
        if (el.value && !Validation.rules.phoneSN(el.value)) el.classList.add('inp-error');
        else el.classList.remove('inp-error');
      };
    });

    // Photo
    const photoIn = document.getElementById('photo-input');
    if (photoIn) {
      photoIn.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const p = cv().personal;
          p.photo = ev.target.result;
          DB.CVs.updateField(_uid, _cvId, 'personal', p);
          render();
          autosaveFlash();
          const prev = document.getElementById('photo-preview');
          if (prev) { prev.src = ev.target.result; prev.style.display = 'block'; }
          const ph = document.getElementById('photo-placeholder');
          if (ph) ph.style.display = 'none';
        };
        reader.readAsDataURL(file);
      };
      const p = cv().personal;
      if (p.photo) {
        const prev = document.getElementById('photo-preview');
        if (prev) { prev.src = p.photo; prev.style.display = 'block'; }
        const ph = document.getElementById('photo-placeholder');
        if (ph) ph.style.display = 'none';
      }
    }
  };

  /*  Expériences ─ */
  const renderExpList = () => {
    const data = cv();
    const container = document.getElementById('exp-list');
    if (!container || !data) return;
    container.innerHTML = '';
    document.getElementById('b-exp').textContent = data.experience.length;

    if (!data.experience.length) {
      container.innerHTML = '<p class="list-empty">Aucune expérience ajoutée.</p>';
      return;
    }

    data.experience.forEach((e, i) => {
      const card = createEntryCard(
        e.position,
        `${e.company}${e.startDate ? ' · ' + e.startDate : ''}`,
        () => openExpModal(i),
        () => deleteEntry('experience', i)
      );
      container.appendChild(card);
    });
  };

  const openExpModal = (idx = null) => {
    const data = cv();
    const entry = idx !== null ? data.experience[idx] : null;
    openModal('modal-exp', {
      title: idx !== null ? 'Modifier une expérience' : 'Nouvelle expérience',
      fields: [
        { name:'company',   label:'Entreprise',  req:true,   placeholder:'Orange Sénégal, etc.' },
        { name:'position',  label:'Poste',        req:true,   placeholder:'Chef de projet' },
        { name:'location',  label:'Lieu',         half:true,  placeholder:'Dakar, Thiès...' },
        { name:'startDate', label:'Début',        req:true,   half:true, placeholder:'Jan 2022' },
        { name:'endDate',   label:'Fin',          half:true,  placeholder:'Déc 2023' },
        { name:'current',   label:'Poste actuel', type:'checkbox' },
        { name:'description', label:'Description', type:'textarea', placeholder:'Principales missions et réalisations...' },
      ],
      values: entry || {},
      onSave: vals => {
        const arr = cv().experience;
        const obj = { company:vals.company, position:vals.position, location:vals.location||'', startDate:vals.startDate, endDate:vals.endDate||'', current:!!vals.current, description:vals.description||'' };
        const errs = Validation.validate('experience', obj);
        if (Object.keys(errs).length) {
          Validation.display.show(document.getElementById('modal-exp').querySelector('form'), errs);
          return false;
        }
        if (idx !== null) arr[idx] = obj; else arr.push(obj);
        DB.CVs.updateField(_uid, _cvId, 'experience', arr);
        renderExpList(); render(); autosaveFlash();
        Validation.toast.success('Expérience sauvegardée');
        return true;
      },
    });
  };

  /*  Formation ─ */
  const renderEduList = () => {
    const data = cv();
    const container = document.getElementById('edu-list');
    if (!container || !data) return;
    container.innerHTML = '';
    document.getElementById('b-edu').textContent = data.education.length;

    if (!data.education.length) {
      container.innerHTML = '<p class="list-empty">Aucune formation ajoutée.</p>';
      return;
    }

    data.education.forEach((e, i) => {
      const card = createEntryCard(
        e.degree,
        `${e.institution}${e.startYear ? ' · ' + e.startYear : ''}`,
        () => openEduModal(i),
        () => deleteEntry('education', i)
      );
      container.appendChild(card);
    });
  };

  const openEduModal = (idx = null) => {
    const entry = idx !== null ? cv().education[idx] : null;
    openModal('modal-edu', {
      title: idx !== null ? 'Modifier la formation' : 'Nouvelle formation',
      fields: [
        { name:'institution', label:'Établissement', req:true, placeholder:'UCAD, ESP, ISM...' },
        { name:'degree',      label:'Diplôme',       req:true, half:true, placeholder:'Master, Licence...' },
        { name:'field',       label:'Spécialité',    half:true, placeholder:'Informatique, Gestion...' },
        { name:'startYear',   label:'Début',         req:true, half:true, placeholder:'2018' },
        { name:'endYear',     label:'Fin',           half:true, placeholder:'2022' },
        { name:'description', label:'Description',   type:'textarea', placeholder:'Mention, projet de fin...' },
      ],
      values: entry || {},
      onSave: vals => {
        const arr = cv().education;
        const obj = { institution:vals.institution, degree:vals.degree, field:vals.field||'', startYear:vals.startYear, endYear:vals.endYear||'', description:vals.description||'' };
        const errs = Validation.validate('education', obj);
        if (Object.keys(errs).length) {
          Validation.display.show(document.getElementById('modal-edu').querySelector('form'), errs);
          return false;
        }
        if (idx !== null) arr[idx] = obj; else arr.push(obj);
        DB.CVs.updateField(_uid, _cvId, 'education', arr);
        renderEduList(); render(); autosaveFlash();
        Validation.toast.success('Formation sauvegardée');
        return true;
      },
    });
  };

  /*  Compétences ─ */
  const renderSkillList = () => {
    const data = cv();
    const container = document.getElementById('sk-list');
    if (!container || !data) return;
    container.innerHTML = '';
    document.getElementById('b-sk').textContent = data.skills.length;

    if (!data.skills.length) {
      container.innerHTML = '<p class="list-empty">Aucune compétence ajoutée.</p>';
      return;
    }

    data.skills.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'sk-row';
      div.innerHTML = `
        <div class="sk-info">
          <span class="sk-name">${s.name}</span>
          <div class="sk-dots">${Array.from({length:5},(_,j)=>`<span class="sk-dot${j<(s.level||3)?' on':''}"></span>`).join('')}</div>
        </div>
        <div class="sk-acts">
          <button class="icon-btn edit-btn" title="Modifier">✎</button>
          <button class="icon-btn del-btn" title="Supprimer">✕</button>
        </div>`;
      div.querySelector('.edit-btn').onclick = () => openSkillModal(i);
      div.querySelector('.del-btn').onclick  = () => deleteEntry('skills', i);
      container.appendChild(div);
    });
  };

  const openSkillModal = (idx = null) => {
    const entry = idx !== null ? cv().skills[idx] : null;
    openModal('modal-sk', {
      title: idx !== null ? 'Modifier la compétence' : 'Nouvelle compétence',
      fields: [
        { name:'name',     label:'Compétence', req:true, placeholder:'Photoshop, Python, Management...' },
        { name:'category', label:'Catégorie',  type:'select', opts:['Technique','Outil','Soft skill','Autre'] },
        { name:'level',    label:'Niveau (1–5)', type:'range', min:1, max:5 },
      ],
      values: entry || { level: 3 },
      onSave: vals => {
        const arr = cv().skills;
        const obj = { name:vals.name, category:vals.category||'Technique', level:parseInt(vals.level)||3 };
        const errs = Validation.validate('skill', obj);
        if (Object.keys(errs).length) {
          Validation.display.show(document.getElementById('modal-sk').querySelector('form'), errs);
          return false;
        }
        if (idx !== null) arr[idx] = obj; else arr.push(obj);
        DB.CVs.updateField(_uid, _cvId, 'skills', arr);
        renderSkillList(); render(); autosaveFlash();
        Validation.toast.success('Compétence sauvegardée');
        return true;
      },
    });
  };

  /*  Langues ─ */
  const bindLanguageForm = () => {
    const btn = document.getElementById('btn-add-lang');
    if (!btn) return;
    btn.onclick = () => {
      const name = document.getElementById('lang-name').value.trim();
      const level = document.getElementById('lang-level').value;
      if (!name) { Validation.toast.error('Entrez une langue.'); return; }
      const arr = cv().languages;
      arr.push({ name, level });
      DB.CVs.updateField(_uid, _cvId, 'languages', arr);
      document.getElementById('lang-name').value = '';
      renderLangList(); render(); autosaveFlash();
    };
    document.getElementById('lang-name').onkeydown = e => { if (e.key === 'Enter') btn.click(); };
    renderLangList();
  };

  const renderLangList = () => {
    const data = cv();
    const container = document.getElementById('lang-list');
    if (!container || !data) return;
    container.innerHTML = data.languages.length
      ? data.languages.map((l,i) => `
        <div class="chip-row">
          <span class="chip-name">${l.name}</span>
          <span class="chip-lvl">${l.level}</span>
          <button class="icon-btn del-btn" onclick="UI._delLang(${i})">✕</button>
        </div>`).join('')
      : '<p class="list-empty">Aucune langue.</p>';
  };

  const _delLang = i => {
    const arr = cv().languages;
    arr.splice(i, 1);
    DB.CVs.updateField(_uid, _cvId, 'languages', arr);
    renderLangList(); render(); autosaveFlash();
  };

  /*  Centres d'intérêt ─ */
  const bindInterestForm = () => {
    const btn = document.getElementById('btn-add-int');
    if (!btn) return;
    const inp = document.getElementById('int-input');
    const add = () => {
      const v = inp.value.trim();
      if (!v) return;
      const arr = cv().interests;
      arr.push({ name: v });
      DB.CVs.updateField(_uid, _cvId, 'interests', arr);
      inp.value = '';
      renderInterestList(); render(); autosaveFlash();
    };
    btn.onclick = add;
    inp.onkeydown = e => { if (e.key === 'Enter') add(); };
    renderInterestList();
  };

  const renderInterestList = () => {
    const data = cv();
    const container = document.getElementById('int-list');
    if (!container || !data) return;
    container.innerHTML = data.interests.length
      ? `<div class="chips-wrap">${data.interests.map((i,idx)=>`<span class="chip">${i.name}<button onclick="UI._delInt(${idx})">×</button></span>`).join('')}</div>`
      : '<p class="list-empty">Aucun intérêt.</p>';
  };

  const _delInt = i => {
    const arr = cv().interests;
    arr.splice(i, 1);
    DB.CVs.updateField(_uid, _cvId, 'interests', arr);
    renderInterestList(); render(); autosaveFlash();
  };

  /*  Certifications  */
  const bindCertForm = () => {
    const btn = document.getElementById('btn-add-cert');
    if (!btn) return;
    btn.onclick = () => {
      const name = document.getElementById('cert-name').value.trim();
      if (!name) { Validation.toast.error('Entrez le nom de la certification.'); return; }
      const arr = cv().certifications;
      arr.push({ name, issuer: document.getElementById('cert-issuer').value.trim(), year: document.getElementById('cert-year').value.trim() });
      DB.CVs.updateField(_uid, _cvId, 'certifications', arr);
      ['cert-name','cert-issuer','cert-year'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
      renderCertList(); render(); autosaveFlash();
      Validation.toast.success('Certification ajoutée');
    };
    renderCertList();
  };

  const renderCertList = () => {
    const data = cv();
    const container = document.getElementById('cert-list');
    if (!container || !data) return;
    container.innerHTML = data.certifications.length
      ? data.certifications.map((c,i) => `
        <div class="entry-card">
          <div class="entry-info"><strong>${c.name}</strong><span>${[c.issuer,c.year].filter(Boolean).join(' · ')}</span></div>
          <button class="icon-btn del-btn" onclick="UI._delCert(${i})">✕</button>
        </div>`).join('')
      : '<p class="list-empty">Aucune certification.</p>';
  };

  const _delCert = i => {
    const arr = cv().certifications;
    arr.splice(i, 1);
    DB.CVs.updateField(_uid, _cvId, 'certifications', arr);
    renderCertList(); render(); autosaveFlash();
  };

  /*  Suppression générique ─ */
  const deleteEntry = (field, idx) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    const arr = cv()[field];
    arr.splice(idx, 1);
    DB.CVs.updateField(_uid, _cvId, field, arr);
    if (field === 'experience') renderExpList();
    if (field === 'education')  renderEduList();
    if (field === 'skills')     renderSkillList();
    render(); autosaveFlash();
  };

  /*  Templates ─ */
  const renderTemplateGrid = () => {
    const container = document.getElementById('tpl-grid');
    if (!container) return;
    const data = cv();
    const thumbBg = { sidebar: 'linear-gradient(135deg,#0f0f0f,#1a1610)', banner: '#0f0f0f' };
    container.innerHTML = Templates.list().map(t => `
      <div class="tpl-card ${data?.template === t.id ? 'active' : ''}" data-tpl="${t.id}" onclick="UI.setTemplate('${t.id}')">
        <div class="tpl-thumb" style="background:${thumbBg[t.id]||'#111'}"></div>
        <div class="tpl-meta">
          <div class="tpl-name">${t.name}</div>
          <div class="tpl-desc">${t.desc}</div>
          ${data?.template === t.id ? '<div class="tpl-active-badge">Actif</div>' : ''}
        </div>
      </div>`).join('');
  };

  const setTemplate = id => {
    DB.CVs.updateField(_uid, _cvId, 'template', id);
    renderTemplateGrid();
    render();
    autosaveFlash();
    Validation.toast.success(`Template "${id}" appliqué`);
  };

  /*  Liste CVs dans la sidebar ─ */
  const renderCVList = () => {
    const container = document.getElementById('cv-list-sidebar');
    if (!container) return;
    const cvs = DB.CVs.list(_uid);
    container.innerHTML = cvs.length ? cvs.map(c => `
      <div class="cv-item ${c.id === _cvId ? 'active' : ''}" data-cid="${c.id}">
        <div class="cv-item-info" onclick="UI.switchCV('${c.id}')">
          <div class="cv-item-name">${c.title}</div>
          <div class="cv-item-meta">${c.template} · ${DB.fmt(c.updatedAt)}</div>
        </div>
        <div class="cv-item-acts">
          <button class="icon-btn" title="Dupliquer" onclick="UI.duplicateCV('${c.id}')">⧉</button>
          <button class="icon-btn del-btn" title="Supprimer" onclick="UI.deleteCV('${c.id}')">✕</button>
        </div>
      </div>`).join('')
    : '<p class="list-empty">Aucun CV créé.</p>';
  };

  const switchCV = id => {
    _cvId = id;
    DB.CVs.setActive(_uid, id);
    renderCVList();
    loadCVEditor();
    Validation.toast.info(`CV "${cv().title}" chargé`);
  };

  const newCV = () => {
    const title = prompt('Nom du nouveau CV :', 'Mon CV');
    if (!title) return;
    const created = DB.CVs.create(_uid, title);
    _cvId = created.id;
    renderCVList();
    loadCVEditor();
    Validation.toast.success(`CV "${title}" créé`);
  };

  const duplicateCV = id => {
    const copy = DB.CVs.duplicate(_uid, id);
    renderCVList();
    Validation.toast.success(`CV dupliqué : "${copy.title}"`);
  };

  const deleteCV = id => {
    const c = DB.CVs.get(_uid, id);
    if (!confirm(`Supprimer "${c?.title}" ?`)) return;
    const remaining = DB.CVs.delete(_uid, id);
    if (!remaining) {
      const fresh = DB.CVs.create(_uid, 'Mon CV');
      _cvId = fresh.id;
    } else {
      _cvId = DB.CVs.getActive(_uid) || DB.CVs.list(_uid)[0]?.id;
    }
    renderCVList();
    loadCVEditor();
    Validation.toast.info('CV supprimé');
  };

  /*  Charge l'éditeur pour le CV courant ─ */
  const loadCVEditor = () => {
    const data = cv();
    if (!data) return;
    // Titre dans l'en-tête
    const titleEl = document.getElementById('cv-title-display');
    if (titleEl) titleEl.textContent = data.title;
    bindPersonalForm();
    renderExpList();
    renderEduList();
    renderSkillList();
    bindLanguageForm();
    bindInterestForm();
    bindCertForm();
    renderTemplateGrid();
    render();
  };

  /*  Validate Personal ─ */
  const validatePersonal = () => {
    const data = cv();
    const errs = Validation.validate('personal', data.personal);
    const form = document.getElementById('personal-form');
    Validation.display.clear(form);
    if (Object.keys(errs).length) {
      Validation.display.show(form, errs);
      Validation.toast.error(`${Object.keys(errs).length} erreur(s) à corriger`);
    } else {
      Validation.toast.success('Informations personnelles valides !');
    }
  };

  /*  Navigation tabs ─ */
  const bindTabs = () => {
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add('active'));
        const sec = document.getElementById(`sec-${tabId}`);
        if (sec) sec.classList.add('active');
        if (tabId === 'templates') renderTemplateGrid();
      });
    });
  };

  /*  Modal générique ─ */
  const openModal = (id, config) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    const form = modal.querySelector('form');
    if (!form) return;

    // Titre
    const titleEl = modal.querySelector('.modal-title');
    if (titleEl) titleEl.textContent = config.title;

    // Vider & construire le formulaire
    form.innerHTML = '';
    Validation.display.clear(form);

    const grid = document.createElement('div');
    grid.className = 'form-grid';

    config.fields.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = `fg${f.half ? ' half' : ''} ${f.type === 'textarea' ? 'full' : ''}`;

      if (f.type === 'checkbox') {
        wrap.innerHTML = `<label class="check-row"><input type="checkbox" name="${f.name}" ${config.values[f.name] ? 'checked' : ''}><span>${f.label}</span></label>`;
      } else if (f.type === 'select') {
        wrap.innerHTML = `<label class="fl">${f.label}</label><select name="${f.name}" class="inp">${f.opts.map(o=>`<option ${config.values[f.name]===o?'selected':''}>${o}</option>`).join('')}</select>`;
      } else if (f.type === 'range') {
        const val = config.values[f.name] || f.min || 3;
        wrap.innerHTML = `<label class="fl">${f.label}</label><div class="range-row"><span class="range-label">Déb.</span><input type="range" name="${f.name}" min="${f.min||1}" max="${f.max||5}" value="${val}" class="inp-range" oninput="this.nextElementSibling.nextElementSibling.textContent=this.value"><span class="range-label">Exp.</span><span class="range-val">${val}</span></div>`;
      } else if (f.type === 'textarea') {
        wrap.className += ' full';
        wrap.innerHTML = `<label class="fl">${f.label}</label><textarea name="${f.name}" class="inp inp-ta" placeholder="${f.placeholder||''}">${config.values[f.name]||''}</textarea>`;
      } else {
        wrap.innerHTML = `<label class="fl">${f.label}${f.req ? ' <span class="req">*</span>' : ''}</label><input type="text" name="${f.name}" class="inp" value="${config.values[f.name]||''}" placeholder="${f.placeholder||''}">`;
      }
      grid.appendChild(wrap);
    });

    form.appendChild(grid);

    // Bouton save
    const saveBtn = modal.querySelector('.modal-save-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const vals = {};
        form.querySelectorAll('[name]').forEach(inp => {
          vals[inp.name] = inp.type === 'checkbox' ? inp.checked : inp.value.trim();
        });
        const ok = config.onSave(vals);
        if (ok !== false) closeModal(id);
      };
    }

    modal.classList.add('open');
  };

  const closeModal = id => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  };

  /*  Export PDF  */
  const exportPDF = () => {
    const btn = document.getElementById('btn-export');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="spin"></span> Génération...';
    btn.disabled = true;

    setTimeout(() => {
      const content = document.getElementById('cv-output');
      if (!content) { btn.innerHTML = orig; btn.disabled = false; return; }

      const p = cv().personal;
      const name = [p.firstName, p.lastName].filter(Boolean).join('_') || 'cv';
      const pw = window.open('', '_blank', 'width=960,height=720');

      // Extraire tous les styles
      let styles = '';
      try {
        Array.from(document.styleSheets).forEach(ss => {
          try { Array.from(ss.cssRules || []).forEach(r => { styles += r.cssText + '\n'; }); } catch {}
        });
      } catch {}

      styles += `
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cv-root { box-shadow: none !important; }
        .cv-bar-track { height: 3px; background: rgba(0,0,0,0.1); border-radius: 99px; overflow: hidden; }
        .cv-bar-fill  { height: 100%; border-radius: 99px; }
        .cv-nophoto   { background: rgba(255,255,255,0.15); }
      `;

      pw.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CV - ${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Bebas+Neue&family=Lato:wght@300;400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${styles}</style></head>
<body>${content.innerHTML}
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
</body></html>`);
      pw.document.close();

      btn.innerHTML = orig;
      btn.disabled = false;
      Validation.toast.success('Prêt pour l\'impression !');
    }, 400);
  };

  /*  Renommer CV ─ */
  const renameCV = () => {
    const data = cv();
    const newTitle = prompt('Renommer le CV :', data.title);
    if (!newTitle || newTitle === data.title) return;
    DB.CVs.rename(_uid, _cvId, newTitle);
    renderCVList();
    const titleEl = document.getElementById('cv-title-display');
    if (titleEl) titleEl.textContent = newTitle;
    autosaveFlash();
    Validation.toast.success('CV renommé');
  };

  /*  Helper : créer une entry card  */
  const createEntryCard = (title, sub, onEdit, onDel) => {
    const div = document.createElement('div');
    div.className = 'entry-card';
    div.innerHTML = `
      <div class="entry-info"><strong>${title}</strong><span>${sub}</span></div>
      <div class="entry-acts">
        <button class="icon-btn edit-btn" title="Modifier">✎</button>
        <button class="icon-btn del-btn"  title="Supprimer">✕</button>
      </div>`;
    div.querySelector('.edit-btn').onclick = onEdit;
    div.querySelector('.del-btn').onclick  = onDel;
    return div;
  };

  /*  Init  */
  const init = (uid, cvId) => {
    _uid  = uid;
    _cvId = cvId;
    bindTabs();

    // Fermer modales au clic dehors / Escape
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    });

    // Resize
    window.addEventListener('resize', scalePreview);

    renderCVList();
    loadCVEditor();
  };

  /*  API publique */
  return {
    init, render, switchCV, newCV, duplicateCV, deleteCV, renameCV,
    openExpModal, openEduModal, openSkillModal,
    setTemplate, validatePersonal, exportPDF,
    renderExpList, renderEduList, renderSkillList,
    renderLangList, renderInterestList, renderCertList, renderTemplateGrid,
    closeModal,
    _delLang, _delInt, _delCert,
    bindLanguageForm, bindInterestForm, bindCertForm,
  };
})();