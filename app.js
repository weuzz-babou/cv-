/**
 APP MODULE — Sen CV
 3 vues : Landing/Auth → Dashboard → Éditeur
 */
const App = (() => {

  /*  Routing  */
  const showView = id => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const v = document.getElementById(`view-${id}`);
    if (v) v.classList.add('active');
    window.scrollTo(0, 0);
  };

  /*  Auth Registration  */
  const bindRegister = () => {
    const form = document.getElementById('form-register');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      Validation.display.clear(form);
      const name     = form.querySelector('[name=name]').value.trim();
      const email    = form.querySelector('[name=email]').value.trim();
      const password = form.querySelector('[name=password]').value;
      const confirm  = form.querySelector('[name=confirm]').value;
      const errs     = Validation.validate('register', { name, email, password });
      if (confirm !== password) errs.confirm = 'Les mots de passe ne correspondent pas.';
      if (Object.keys(errs).length) { Validation.display.show(form, errs); return; }
      const res = DB.Users.create(name, email, password);
      if (!res.ok) { Validation.display.show(form, { email: res.error }); return; }
      DB.Session.set(res.user.id);
      Validation.toast.success(`Bienvenue ${res.user.name.split(' ')[0]} ! 🎉`);
      loadDashboard(res.user.id);
    });
  };

  /*  Auth Login  */
  const bindLogin = () => {
    const form = document.getElementById('form-login');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      Validation.display.clear(form);
      const email    = form.querySelector('[name=email]').value.trim();
      const password = form.querySelector('[name=password]').value;
      const errs     = Validation.validate('login', { email, password });
      if (Object.keys(errs).length) { Validation.display.show(form, errs); return; }
      const res = DB.Users.login(email, password);
      if (!res.ok) {
        const f = res.error.toLowerCase().includes('compte') ? 'email' : 'password';
        Validation.display.show(form, { [f]: res.error }); return;
      }
      DB.Session.set(res.user.id);
      Validation.toast.success(`Bon retour, ${res.user.name.split(' ')[0]} !`);
      loadDashboard(res.user.id);
    });
  };

  /*  Toggle Login / Register ─ */
  const bindAuthToggle = () => {
    const toReg  = id => { document.getElementById('auth-login')?.classList.remove('active');  document.getElementById('auth-register')?.classList.add('active'); };
    const toLgin = id => { document.getElementById('auth-register')?.classList.remove('active'); document.getElementById('auth-login')?.classList.add('active'); };
    document.getElementById('btn-to-register')?.addEventListener('click', toReg);
    document.getElementById('btn-to-login')?.addEventListener('click', toLgin);
    // Nav buttons
    document.getElementById('nav-login-btn')?.addEventListener('click', () => { toLgin(); document.getElementById('hero-auth-panel')?.scrollIntoView({ behavior:'smooth', block:'center' }); });
    document.getElementById('nav-register-btn')?.addEventListener('click', () => { toReg(); document.getElementById('hero-auth-panel')?.scrollIntoView({ behavior:'smooth', block:'center' }); });

  };

  /*  DASHBOARD  */
  const loadDashboard = uid => {
    const user = DB.Users.getById(uid);
    if (!user) { showView('auth'); return; }

    // Header info
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const setStyle = (id, prop, v) => { const el = document.getElementById(id); if (el) el.style[prop] = v; };
    setEl('dash-user-name', user.name);
    setEl('dash-greeting-name', user.name.split(' ')[0]);
    setEl('dash-date', new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }));
    document.getElementById('dash-user-avatar')?.setAttribute('data-initial', user.avatar);
    const avEl = document.getElementById('dash-user-avatar');
    if (avEl) { avEl.textContent = user.avatar; avEl.style.background = user.color; }

    // Compteurs animés
    const cvList  = DB.CVs.list(uid);
    const stats   = DB.Stats.getAll();
    animCount('stat-my-cvs', cvList.length);
    animCount('stat-templates', 4);
    animCount('stat-total-users', stats.users);
    animCount('stat-total-cvs', stats.cvs);

    // Grille CV
    renderCVGallery(uid);

    showView('dashboard');
  };

  const animCount = (id, target) => {
    const el = document.getElementById(id);
    if (!el) return;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 18));
    const iv = setInterval(() => { n = Math.min(n + step, target); el.textContent = n; if (n >= target) clearInterval(iv); }, 45);
  };

  /*  CV Gallery  */
  const renderCVGallery = uid => {
    const grid = document.getElementById('dash-cv-gallery');
    if (!grid) return;
    const list = DB.CVs.list(uid);
    const tplIcon  = { sidebar:'◼', banner:'▬' };
    const tplLabel = { sidebar:'Sidebar', banner:'Bandeau' };

    const cards = list.map((cv, i) => {
      const p = cv.personal;
      const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || '—';
      return `
      <div class="cv-tile" style="animation-delay:${i*0.05}s">
        <div class="cv-tile-thumb" style="height:120px;overflow:hidden;position:relative;${cv.template==='sidebar' ? 'background:#111318' : 'background:#0f0f0f'}">
          ${cv.template==='sidebar' ? '<div style=\"position:absolute;left:0;top:0;width:36%;height:100%;background:#0f0f0f;border-right:2px solid rgba(201,168,76,.4)\"></div><div style=\"position:absolute;left:38%;top:12px;right:10px;height:10px;background:rgba(255,255,255,.12);border-radius:2px\"></div><div style=\"position:absolute;left:38%;top:26px;right:18px;height:6px;background:rgba(255,255,255,.07);border-radius:2px\"></div><div style=\"position:absolute;left:38%;top:36px;right:22px;height:6px;background:rgba(255,255,255,.07);border-radius:2px\"></div><div style=\"position:absolute;left:8px;top:10px;width:20px;height:20px;border-radius:50%;background:rgba(201,168,76,.3);border:1px solid rgba(201,168,76,.5)\"></div>' : '<div style=\"position:absolute;top:0;left:0;right:0;height:40%;background:#1a1308;border-bottom:2px solid rgba(201,168,76,.4)\"></div><div style=\"position:absolute;top:8px;left:10px;width:22px;height:22px;border-radius:50%;background:rgba(201,168,76,.25);border:1px solid rgba(201,168,76,.4)\"></div><div style=\"position:absolute;top:10px;left:38px;right:10px;height:8px;background:rgba(255,255,255,.15);border-radius:2px\"></div><div style=\"position:absolute;top:22px;left:38px;right:20px;height:5px;background:rgba(255,255,255,.08);border-radius:2px\"></div><div style=\"position:absolute;top:46%;left:10px;right:10px;height:6px;background:rgba(255,255,255,.08);border-radius:2px\"></div><div style=\"position:absolute;top:58%;left:10px;right:20px;height:5px;background:rgba(255,255,255,.06);border-radius:2px\"></div>'}
          <span>${tplIcon[cv.template] || '📄'}</span>
          <div class="cv-tile-tpl-badge">${tplLabel[cv.template] || cv.template}</div>
          <div class="cv-tile-actions">
            <button class="btn btn-gold btn-sm" onclick="App.openEditor('${uid}','${cv.id}')">✏ Éditer</button>
            <button class="btn btn-outline-light btn-sm" onclick="App.dashDuplicate('${uid}','${cv.id}')">⧉</button>
            <button style="width:32px;height:32px;border-radius:8px;background:rgba(220,38,38,.85);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0" onclick="App.dashDelete('${uid}','${cv.id}')">✕</button>
          </div>
        </div>
        <div class="cv-tile-body">
          <div class="cv-tile-title">${cv.title}</div>
          <div class="cv-tile-meta">
            <span>${fullName}</span>
            <span class="cv-tile-meta-sep"></span>
            <span>${DB.fmt(cv.updatedAt)}</span>
          </div>
        </div>
      </div>`;
    }).join('');

    const newTile = `
    <div class="cv-tile-new" onclick="App.dashNewCV('${uid}')">
      <div class="new-plus">＋</div>
      <span>Nouveau CV</span>
    </div>`;

    grid.innerHTML = cards + newTile;
  };

  const dashNewCV = uid => {
    const title = prompt('Nom du nouveau CV :', 'Mon CV');
    if (!title) return;
    const cv = DB.CVs.create(uid, title);
    Validation.toast.success(`"${title}" créé !`);
    openEditor(uid, cv.id);
  };

  const dashDuplicate = (uid, cvId) => {
    const copy = DB.CVs.duplicate(uid, cvId);
    renderCVGallery(uid);
    animCount('stat-my-cvs', DB.CVs.list(uid).length);
    Validation.toast.success(`"${copy.title}" dupliqué`);
  };

  const dashDelete = (uid, cvId) => {
    const cv = DB.CVs.get(uid, cvId);
    if (!confirm(`Supprimer "${cv?.title}" définitivement ?`)) return;
    DB.CVs.delete(uid, cvId);
    renderCVGallery(uid);
    animCount('stat-my-cvs', DB.CVs.list(uid).length);
    Validation.toast.info('CV supprimé');
  };

  /*  Ouvrir l'éditeur  */
  const openEditor = (uid, cvId) => {
    DB.CVs.setActive(uid, cvId);
    const user = DB.Users.getById(uid);
    const avEl = document.getElementById('user-avatar');
    const nmEl = document.getElementById('user-name');
    if (avEl) { avEl.textContent = user?.avatar || '?'; avEl.style.background = user?.color || '#0b6e72'; }
    if (nmEl) nmEl.textContent = user?.name || '';
    UI.init(uid, cvId);
    showView('editor');
  };

  /*  Déconnexion ─ */
  const logout = () => {
    if (!confirm('Se déconnecter ?')) return;
    DB.Session.clear();
    showView('auth');
    Validation.toast.info('Déconnecté');
  };

  /*  Retour au dashboard ─ */
  const backToDash = () => {
    const s = DB.Session.get();
    if (s?.userId) loadDashboard(s.userId);
    else showView('auth');
  };

  /*  Bootstrap ─ */
  const boot = () => {
    bindRegister();
    bindLogin();
    bindAuthToggle();

    // Boutons globaux
    document.getElementById('btn-logout')?.addEventListener('click', logout);
    document.getElementById('btn-dash-logout')?.addEventListener('click', logout);
    document.getElementById('btn-back-dash')?.addEventListener('click', backToDash);
    document.getElementById('btn-export')?.addEventListener('click', () => UI.exportPDF());
    document.getElementById('btn-validate-personal')?.addEventListener('click', () => UI.validatePersonal());
    document.getElementById('btn-rename-cv')?.addEventListener('click', () => UI.renameCV());
    document.getElementById('btn-new-cv')?.addEventListener('click', () => UI.newCV());
    document.getElementById('btn-preview-toggle')?.addEventListener('click', () => {
      document.getElementById('pv-pane')?.classList.toggle('show');
    });

    // Bouton "Ouvrir l'éditeur" depuis le dashboard
    document.getElementById('btn-dash-open-editor')?.addEventListener('click', () => {
      const s = DB.Session.get();
      if (!s?.userId) return;
      let cvId = DB.CVs.getActive(s.userId);
      if (!cvId || !DB.CVs.get(s.userId, cvId)) {
        const list = DB.CVs.list(s.userId);
        cvId = list[0]?.id;
        if (!cvId) { const c = DB.CVs.create(s.userId, 'Mon CV'); cvId = c.id; }
      }
      openEditor(s.userId, cvId);
    });

    // Dashboard new CV
    document.getElementById('btn-dash-new-cv')?.addEventListener('click', () => {
      const s = DB.Session.get();
      if (s?.userId) dashNewCV(s.userId);
    });

    // Modals
    ['btn-add-exp','btn-add-edu','btn-add-sk'].forEach((id, i) => {
      const fns = [() => UI.openExpModal(), () => UI.openEduModal(), () => UI.openSkillModal()];
      document.getElementById(id)?.addEventListener('click', fns[i]);
    });
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => UI.closeModal(btn.dataset.closeModal));
    });

    // Stats live sur la landing
    const stats = DB.Stats.getAll();
    const elU = document.getElementById('lp-stat-users');
    const elC = document.getElementById('lp-stat-cvs');
    if (elU) elU.textContent = stats.users;
    if (elC) elC.textContent = stats.cvs;

    // Session existante
    const s = DB.Session.get();
    if (s?.userId && DB.Users.getById(s.userId)) {
      loadDashboard(s.userId);
    } else {
      showView('auth');
    }
  };

  document.addEventListener('DOMContentLoaded', boot);

  return { logout, backToDash, openEditor, dashNewCV, dashDuplicate, dashDelete, loadDashboard };
})();