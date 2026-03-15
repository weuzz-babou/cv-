/**
 * VALIDATION MODULE — MakeCv Pro
 * Validation complète des données avec messages d'erreur ergonomiques
 */
const Validation = (() => {

  /* ── Règles ──────────────────────────────────────────────── */
  const rules = {
    required: v => v != null && String(v).trim() !== '',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    // Format sénégalais : +221 ou 221, puis 7X/3X suivi de 7 chiffres
    phoneSN:  v => {
      const clean = String(v).replace(/[\s\-\.\(\)]/g, '');
      return /^(\+221|221)?(7[0-9]|3[0-9])\d{7}$/.test(clean);
    },
    password: v => String(v).length >= 6,
    url:      v => !v || /^https?:\/\/.+/.test(v),
    minLen:   (v, n) => String(v).length >= n,
  };

  /* ── Schémas de validation ───────────────────────────────── */
  const schemas = {
    register: {
      name:     [{ fn: rules.required,    msg: 'Nom complet obligatoire.' }],
      email:    [{ fn: rules.required,    msg: 'Email obligatoire.'        },
                 { fn: rules.email,       msg: 'Format email invalide.'    }],
      password: [{ fn: rules.required,    msg: 'Mot de passe obligatoire.' },
                 { fn: rules.password,    msg: 'Minimum 6 caractères.'     }],
    },
    login: {
      email:    [{ fn: rules.required,    msg: 'Email obligatoire.'        },
                 { fn: rules.email,       msg: 'Format email invalide.'    }],
      password: [{ fn: rules.required,    msg: 'Mot de passe obligatoire.' }],
    },
    personal: {
      firstName:[{ fn: rules.required,    msg: 'Prénom obligatoire.'       }],
      lastName: [{ fn: rules.required,    msg: 'Nom obligatoire.'          }],
      title:    [{ fn: rules.required,    msg: 'Titre professionnel requis.'}],
      email:    [{ fn: rules.required,    msg: 'Email obligatoire.'        },
                 { fn: rules.email,       msg: 'Format email invalide.'    }],
      phone:    [{ fn: rules.required,    msg: 'Téléphone obligatoire.'    },
                 { fn: rules.phoneSN,     msg: 'Format sénégalais requis (+221 7X XXX XX XX).' }],
    },
    experience: {
      company:  [{ fn: rules.required,    msg: 'Entreprise obligatoire.'   }],
      position: [{ fn: rules.required,    msg: 'Poste obligatoire.'        }],
      startDate:[{ fn: rules.required,    msg: 'Date de début obligatoire.'}],
    },
    education: {
      institution:[{ fn: rules.required,  msg: 'Établissement obligatoire.'}],
      degree:   [{ fn: rules.required,    msg: 'Diplôme obligatoire.'      }],
      startYear:[{ fn: rules.required,    msg: 'Année de début obligatoire.'}],
    },
    skill: {
      name:     [{ fn: rules.required,    msg: 'Nom de la compétence requis.'}],
    },
  };

  /* ── Moteur de validation ────────────────────────────────── */
  const validate = (schema, data) => {
    const errors = {};
    const s = schemas[schema];
    if (!s) return errors;
    for (const [field, fieldRules] of Object.entries(s)) {
      const val = data[field];
      for (const rule of fieldRules) {
        if (!rule.fn(val)) {
          errors[field] = rule.msg;
          break;
        }
      }
    }
    return errors;
  };

  /* ── Affichage des erreurs ───────────────────────────────── */
  const display = {
    // Affiche les erreurs dans un formulaire
    show(formEl, errors) {
      this.clear(formEl);
      Object.entries(errors).forEach(([field, msg]) => {
        const input = formEl.querySelector(`[name="${field}"], [data-field="${field}"]`);
        if (!input) return;
        input.classList.add('inp-error');
        const err = document.createElement('div');
        err.className = 'field-error';
        err.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6.5a.75.75 0 110-1.5.75.75 0 010 1.5z"/></svg><span>${msg}</span>`;
        input.parentNode.insertBefore(err, input.nextSibling);
        // Animation
        requestAnimationFrame(() => err.classList.add('visible'));
      });
      // Focus premier champ en erreur
      const first = formEl.querySelector('.inp-error');
      if (first) first.focus();
    },

    // Efface toutes les erreurs d'un formulaire
    clear(formEl) {
      formEl.querySelectorAll('.field-error').forEach(e => e.remove());
      formEl.querySelectorAll('.inp-error').forEach(e => e.classList.remove('inp-error'));
    },

    // Efface l'erreur d'un champ spécifique
    clearField(input) {
      input.classList.remove('inp-error');
      const err = input.nextSibling;
      if (err && err.classList?.contains('field-error')) err.remove();
    },
  };

  /* ── Toast notifications ─────────────────────────────────── */
  const toast = (() => {
    let container;
    const init = () => {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
    };
    return {
      show(msg, type = 'info', duration = 3500) {
        init();
        const icons = {
          success: '✓', error: '✕', info: 'ℹ', warning: '⚠',
        };
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentNode.remove()">×</button>`;
        container.appendChild(t);
        requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('in')); });
        setTimeout(() => {
          t.classList.remove('in');
          t.classList.add('out');
          setTimeout(() => t.remove(), 400);
        }, duration);
        return t;
      },
      success: (m, d) => toast.show(m, 'success', d),
      error:   (m, d) => toast.show(m, 'error', d),
      info:    (m, d) => toast.show(m, 'info', d),
      warning: (m, d) => toast.show(m, 'warning', d),
    };
  })();

  return { validate, display, toast, rules };
})();
