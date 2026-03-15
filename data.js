/**DATA MODULE — Sen CV
  Gestion de la base de données locale multi-utilisateurs
  Stockage : localStorage avec clés séparées par utilisateur*/
const DB = (() => {
  const KEYS = {
    USERS:    'scv_users',
    SESSION:  'scv_session',
    CVS:      uid => `scv_cvs_${uid}`,
    ACTIVE:   uid => `scv_active_${uid}`,
  };

  /* Utilitaires  */
  const ls = {
    get: k  => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del: k  => { try { localStorage.removeItem(k); } catch {} },
  };

  const uid = () => `u_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const cid = () => `cv_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const now = () => new Date().toISOString();
  const fmt = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  /* Structure CV vierge */
  const blankCV = (title = 'Mon CV') => ({
    id:         cid(),
    title,
    template:   'sidebar',
    createdAt:  now(),
    updatedAt:  now(),
    personal: {
      firstName:'', lastName:'', title:'', email:'', phone:'',
      address:'', city:'', linkedin:'', website:'', summary:'', photo:''
    },
    experience:  [],
    education:   [],
    skills:      [],
    languages:   [],
    interests:   [],
    certifications: [],
  });

  /* Gestion Utilisateurs*/
  const Users = {
    getAll() { return ls.get(KEYS.USERS) || {}; },
    save(users) { ls.set(KEYS.USERS, users); },

    create(name, email, password) {
      const users = this.getAll();
      const exists = Object.values(users).find(u => u.email === email.toLowerCase());
      if (exists) return { ok: false, error: 'Cet email est déjà utilisé.' };
      const id = uid();
      users[id] = {
        id, name, email: email.toLowerCase(),
        password: btoa(password), // simple obfuscation
        createdAt: now(),
        avatar: name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
        color: `hsl(${(email.length * 47) % 360}, 65%, 55%)`,
      };
      this.save(users);
      // Créer un CV vide par défaut
      CVs.create(id, 'Mon premier CV');
      return { ok: true, user: users[id] };
    },

    login(email, password) {
      const users = this.getAll();
      const user = Object.values(users).find(u => u.email === email.toLowerCase());
      if (!user) return { ok: false, error: 'Aucun compte avec cet email.' };
      if (atob(user.password) !== password) return { ok: false, error: 'Mot de passe incorrect.' };
      return { ok: true, user };
    },

    getById(id) { return this.getAll()[id] || null; },

    update(id, data) {
      const users = this.getAll();
      if (!users[id]) return false;
      users[id] = { ...users[id], ...data };
      this.save(users);
      return true;
    },

    delete(id) {
      const users = this.getAll();
      delete users[id];
      this.save(users);
      ls.del(KEYS.CVS(id));
      ls.del(KEYS.ACTIVE(id));
    },
  };

  /* Gestion CVs  */
  const CVs = {
    getAll(uid) { return ls.get(KEYS.CVS(uid)) || {}; },
    save(uid, cvs) { ls.set(KEYS.CVS(uid), cvs); },

    create(uid, title = 'Nouveau CV') {
      const cvs = this.getAll(uid);
      const cv = blankCV(title);
      cvs[cv.id] = cv;
      this.save(uid, cvs);
      this.setActive(uid, cv.id);
      return cv;
    },

    get(uid, cvId) { return this.getAll(uid)[cvId] || null; },

    update(uid, cvId, data) {
      const cvs = this.getAll(uid);
      if (!cvs[cvId]) return false;
      cvs[cvId] = { ...cvs[cvId], ...data, updatedAt: now() };
      this.save(uid, cvs);
      return true;
    },

    updateField(uid, cvId, field, value) {
      const cvs = this.getAll(uid);
      if (!cvs[cvId]) return false;
      cvs[cvId][field] = value;
      cvs[cvId].updatedAt = now();
      this.save(uid, cvs);
      return true;
    },

    delete(uid, cvId) {
      const cvs = this.getAll(uid);
      delete cvs[cvId];
      this.save(uid, cvs);
      // Si on supprime l'actif, en choisir un autre
      const remaining = Object.keys(cvs);
      if (this.getActive(uid) === cvId) {
        this.setActive(uid, remaining.length ? remaining[0] : null);
      }
      return remaining.length;
    },

    duplicate(uid, cvId) {
      const cvs = this.getAll(uid);
      const src = cvs[cvId];
      if (!src) return null;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = cid();
      copy.title = src.title + ' (copie)';
      copy.createdAt = now();
      copy.updatedAt = now();
      cvs[copy.id] = copy;
      this.save(uid, cvs);
      return copy;
    },

    rename(uid, cvId, title) {
      return this.updateField(uid, cvId, 'title', title);
    },

    list(uid) {
      return Object.values(this.getAll(uid))
        .sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },

    getActive(uid) { return ls.get(KEYS.ACTIVE(uid)); },
    setActive(uid, cvId) { ls.set(KEYS.ACTIVE(uid), cvId); },
  };

  /* Session */
  const Session = {
    get() { return ls.get(KEYS.SESSION); },
    set(userId) { ls.set(KEYS.SESSION, { userId, at: now() }); },
    clear() { ls.del(KEYS.SESSION); },
    isLoggedIn() { return !!this.get()?.userId; },
    userId() { return this.get()?.userId || null; },
  };

  /* Stats */
  const Stats = {
    getAll() {
      const users = Users.getAll();
      const total = Object.keys(users).length;
      let totalCVs = 0;
      Object.keys(users).forEach(uid => {
        totalCVs += Object.keys(CVs.getAll(uid)).length;
      });
      return { users: total, cvs: totalCVs };
    },
  };

  /* API publique  */
  return { Users, CVs, Session, Stats, fmt, blankCV };
})();