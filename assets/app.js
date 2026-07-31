/* Programmes 2027 — application statique, sans dépendance.
   Toutes les données sont chargées depuis /data/*.json et rendues côté client. */

(() => {
  'use strict';

  const DB = { meta: null, themes: [], candidats: [], propositions: [], clivages: [] };
  const app = document.getElementById('app');

  /* ---------- utilitaires ---------- */

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const byId = (arr, id) => arr.find((x) => x.id === id);

  const STATUTS = {
    declare: { label: 'Candidature déclarée', cls: 'ok' },
    conditionnel: { label: 'Déclaré sous conditions', cls: 'warn' },
    pressenti: { label: 'Pressenti, non déclaré', cls: 'neutral' },
    retire: { label: 'Candidature retirée', cls: 'diff' }
  };

  const ETATS_PROGRAMME = {
    'complet': { label: 'Programme complet publié', cls: 'ok' },
    'partiel': { label: 'Programme partiel', cls: 'ok' },
    'orientations': { label: 'Orientations publiées', cls: 'warn' },
    'corpus-existant': { label: 'Corpus programmatique existant', cls: 'warn' },
    'aucun-publie-2027': { label: 'Aucun programme 2027 publié', cls: 'neutral' }
  };

  const VERIF = {
    'source-primaire': { label: 'Source officielle', cls: 'ok', desc: 'Document publié par le candidat ou son équipe de campagne.' },
    'source-media': { label: 'Source média', cls: 'warn', desc: 'Propos rapportés par un média identifié, sans document officiel équivalent.' },
    'a-verifier': { label: 'À vérifier', cls: 'diff', desc: 'Élément signalé mais non encore confirmé par une source fiable.' }
  };

  const FAMILLES = [
    ['extreme-gauche', 'Extrême gauche'],
    ['gauche', 'Gauche'],
    ['centre', 'Centre'],
    ['droite', 'Droite'],
    ['extreme-droite', 'Extrême droite'],
    ['divers', 'Divers / non classés']
  ];

  const fmtDate = (iso) => {
    if (!iso) return '';
    const parts = String(iso).split('-');
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    if (parts.length === 3) return `${Number(parts[2])} ${mois[Number(parts[1]) - 1]} ${parts[0]}`;
    if (parts.length === 2) return `${mois[Number(parts[1]) - 1]} ${parts[0]}`;
    return parts[0];
  };

  const badge = (label, cls = '', title = '') =>
    `<span class="badge ${cls}"${title ? ` title="${esc(title)}"` : ''}>${esc(label)}</span>`;

  const sourcesHtml = (sources = []) => {
    if (!sources.length) return '';
    return `<div class="sources">Source${sources.length > 1 ? 's' : ''} :
      ${sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.titre)}</a>
        <span class="muted">— ${esc(s.editeur || '')}${s.consulte_le ? `, consulté le ${fmtDate(s.consulte_le)}` : ''}</span>`).join(' · ')}
    </div>`;
  };

  const propsFor = (candidatId) => DB.propositions.filter((p) => p.candidat === candidatId);
  const themeOf = (id) => byId(DB.themes, id) || { id, nom: id, icone: '•' };

  /* ---------- composants ---------- */

  function candCard(c) {
    const st = STATUTS[c.statut] || STATUTS.pressenti;
    const ep = ETATS_PROGRAMME[c.etat_programme] || ETATS_PROGRAMME['aucun-publie-2027'];
    const n = propsFor(c.id).length;
    return `<a class="cand-card" href="#/candidat/${esc(c.id)}" style="--c:${esc(c.couleur || '#999')}">
      <div class="cand-name"><span class="dot"></span><h3>${esc(c.nom)}</h3></div>
      <div class="parti">${esc(c.parti)}</div>
      <div class="row">${badge(st.label, st.cls)}${badge(ep.label, ep.cls)}</div>
      <div class="muted small">${n} proposition${n > 1 ? 's' : ''} référencée${n > 1 ? 's' : ''}</div>
    </a>`;
  }

  function propCard(p, withCandidat = false) {
    const v = VERIF[p.statut_verification] || VERIF['a-verifier'];
    const c = byId(DB.candidats, p.candidat);
    return `<article class="prop">
      <div class="row" style="justify-content:space-between;margin-bottom:6px">
        <span class="badge neutral">${esc(themeOf(p.theme).icone)} ${esc(themeOf(p.theme).nom)}</span>
        ${badge(v.label, v.cls, v.desc)}
      </div>
      <h4>${esc(p.titre)}</h4>
      ${withCandidat && c ? `<div class="muted small" style="margin:-4px 0 8px">${esc(c.nom)} — ${esc(c.parti)}</div>` : ''}
      <p>${esc(p.resume)}</p>
      ${p.citation ? `<blockquote class="quote">« ${esc(p.citation)} »</blockquote>` : ''}
      ${p.chiffrage ? `<span class="chiffrage">${esc(p.chiffrage)}</span>` : ''}
      ${sourcesHtml(p.sources)}
    </article>`;
  }

  /* ---------- vues ---------- */

  function vueAccueil() {
    const m = DB.meta;
    const t1 = new Date(m.election.premier_tour + 'T00:00:00');
    const jours = Math.max(0, Math.ceil((t1 - new Date()) / 86400000));
    const declares = DB.candidats.filter((c) => c.statut === 'declare');
    const avecProg = DB.candidats.filter((c) => ['complet', 'partiel', 'orientations', 'corpus-existant'].includes(c.etat_programme));
    const misEnAvant = DB.candidats
      .filter((c) => propsFor(c.id).length > 0)
      .sort((a, b) => propsFor(b.id).length - propsFor(a.id).length);

    return `
    <section class="hero">
      <h1>Comparer les programmes, pas les slogans</h1>
      <p class="lead">${esc(m.sous_titre)}. Chaque proposition affichée ici renvoie à sa source d'origine et à sa date. Vous jugez, nous documentons.</p>
      <div class="countdown">
        <div><b>J−${jours}</b><span>1<sup>er</sup> tour · ${fmtDate(m.election.premier_tour)}</span></div>
        <div><b>${DB.candidats.length}</b><span>candidats suivis</span></div>
        <div><b>${declares.length}</b><span>déclarés</span></div>
        <div><b>${avecProg.length}</b><span>avec éléments programmatiques</span></div>
        <div><b>${DB.propositions.length}</b><span>propositions sourcées</span></div>
      </div>
    </section>

    <div class="notice"><strong>À lire avant tout.</strong> ${esc(m.avertissement)}</div>

    <div class="section-title"><h2>Par où commencer</h2></div>
    <div class="grid cols-3">
      <a class="card" href="#/comparateur" style="text-decoration:none;color:inherit">
        <h3>⚖️ Comparateur</h3>
        <p class="muted">Mettez côte à côte jusqu'à six candidats, thème par thème.</p>
      </a>
      <a class="card" href="#/convergences" style="text-decoration:none;color:inherit">
        <h3>🤝 Accords &amp; désaccords</h3>
        <p class="muted">Où les candidats convergent, où ils s'opposent, et où les positions restent floues.</p>
      </a>
      <a class="card" href="#/themes" style="text-decoration:none;color:inherit">
        <h3>🗂️ Par thème</h3>
        <p class="muted">Retraites, immigration, économie, écologie… toutes les positions connues.</p>
      </a>
    </div>

    <div class="section-title"><h2>Candidats déjà documentés</h2><span class="count">${misEnAvant.length} sur ${DB.candidats.length}</span></div>
    <div class="grid cols-3">${misEnAvant.map(candCard).join('')}</div>
    <p style="margin-top:14px"><a href="#/candidats">Voir les ${DB.candidats.length} candidats et prétendants suivis →</a></p>
    `;
  }

  function vueCandidats() {
    const groupes = FAMILLES.map(([id, label]) => {
      const list = DB.candidats.filter((c) => c.famille === id);
      if (!list.length) return '';
      const ordre = { declare: 0, conditionnel: 1, pressenti: 2, retire: 3 };
      list.sort((a, b) => (ordre[a.statut] - ordre[b.statut]) || a.nom.localeCompare(b.nom, 'fr'));
      return `<div class="section-title"><h2>${esc(label)}</h2><span class="count">${list.length}</span></div>
        <div class="grid cols-3">${list.map(candCard).join('')}</div>`;
    }).join('');

    return `<h1>Candidats et prétendants</h1>
      <p class="lead muted">Toute personne publiquement déclarée ou dont la candidature est activement évoquée dans la presse est listée ici, qu'elle ait ou non publié un programme. Le classement par famille politique reprend celui utilisé par les rédactions parlementaires ; il est indicatif et discutable — <a href="#/methodologie">voir la méthodologie</a>.</p>
      <div class="notice small">Rappel : se déclarer ne suffit pas. Pour figurer sur le bulletin, un candidat doit réunir 500 parrainages d'élus issus d'au moins 30 départements ou collectivités, sans que plus d'un dixième provienne d'un même département.</div>
      ${groupes}`;
  }

  function vueCandidat(id) {
    const c = byId(DB.candidats, id);
    if (!c) return `<div class="empty-state">Candidat introuvable. <a href="#/candidats">Retour à la liste</a></div>`;
    const st = STATUTS[c.statut] || STATUTS.pressenti;
    const ep = ETATS_PROGRAMME[c.etat_programme] || ETATS_PROGRAMME['aucun-publie-2027'];
    const props = propsFor(c.id);
    const parTheme = DB.themes
      .map((t) => [t, props.filter((p) => p.theme === t.id)])
      .filter(([, ps]) => ps.length);

    const positions = DB.clivages
      .filter((cl) => cl.positions && cl.positions[c.id])
      .map((cl) => {
        const opt = cl.options.find((o) => o.id === cl.positions[c.id].option);
        return `<li><strong>${esc(cl.question)}</strong><br><span class="muted">${esc(opt ? opt.label : '—')}</span></li>`;
      });

    return `
      <p class="breadcrumb"><a href="#/candidats">Candidats</a> / ${esc(c.nom)}</p>
      <div class="card" style="border-left:6px solid ${esc(c.couleur || '#999')}">
        <h1 style="margin-bottom:4px">${esc(c.nom)}</h1>
        <p class="muted" style="margin-bottom:10px">${esc(c.parti)}${c.date_declaration ? ` · déclaré en ${fmtDate(c.date_declaration)}` : ''}${c.date_retrait ? ` · retrait le ${fmtDate(c.date_retrait)}` : ''}</p>
        <div class="row">${badge(st.label, st.cls)}${badge(ep.label, ep.cls)}</div>
        ${c.note ? `<p style="margin-top:14px">${esc(c.note)}</p>` : ''}
        <div class="row" style="margin-top:12px">
          ${c.site_officiel ? `<a class="btn" href="${esc(c.site_officiel)}" target="_blank" rel="noopener noreferrer">Site officiel ↗</a>` : ''}
          ${c.programme_url ? `<a class="btn primary" href="${esc(c.programme_url)}" target="_blank" rel="noopener noreferrer">Programme publié ↗</a>` : ''}
          <a class="btn" href="#/comparateur?c=${esc(c.id)}">Comparer</a>
        </div>
        ${sourcesHtml(c.sources)}
      </div>

      ${positions.length ? `<div class="section-title"><h2>Positions sur les questions clés</h2></div>
        <div class="card"><ul class="clean">${positions.join('')}</ul></div>` : ''}

      <div class="section-title"><h2>Propositions référencées</h2><span class="count">${props.length}</span></div>
      ${props.length
        ? parTheme.map(([t, ps]) => `
            <h3 style="margin-top:1.6rem">${esc(t.icone)} ${esc(t.nom)}</h3>
            <div class="grid cols-2">${ps.map((p) => propCard(p)).join('')}</div>`).join('')
        : `<div class="empty-state">
             <p><strong>Aucune proposition sourcée à ce jour.</strong></p>
             <p class="small">Cela ne signifie pas que ce candidat n'a pas d'idées : cela signifie qu'aucun document programmatique public et vérifiable n'a encore été publié, ou qu'il n'a pas encore été intégré ici. Une source à nous signaler ? <a href="${esc(DB.meta.depot)}/issues/new/choose">Ouvrez un ticket</a>.</p>
           </div>`}
    `;
  }

  function vueThemes() {
    return `<h1>Thèmes</h1>
      <p class="lead muted">Chaque thème regroupe les propositions sourcées de tous les candidats, et les questions clés qui les séparent.</p>
      <div class="grid cols-3">
        ${DB.themes.map((t) => {
          const n = DB.propositions.filter((p) => p.theme === t.id).length;
          const q = DB.clivages.filter((c) => c.theme === t.id).length;
          return `<a class="card" href="#/theme/${esc(t.id)}" style="text-decoration:none;color:inherit">
            <h3>${esc(t.icone)} ${esc(t.nom)}</h3>
            <p class="muted small">${esc(t.description)}</p>
            <div class="row">${badge(`${n} proposition${n > 1 ? 's' : ''}`)}${badge(`${q} question${q > 1 ? 's' : ''} clé${q > 1 ? 's' : ''}`)}</div>
          </a>`;
        }).join('')}
      </div>`;
  }

  function vueTheme(id) {
    const t = byId(DB.themes, id);
    if (!t) return `<div class="empty-state">Thème introuvable. <a href="#/themes">Retour</a></div>`;
    const props = DB.propositions.filter((p) => p.theme === id);
    const clivages = DB.clivages.filter((c) => c.theme === id);

    return `<p class="breadcrumb"><a href="#/themes">Thèmes</a> / ${esc(t.nom)}</p>
      <h1>${esc(t.icone)} ${esc(t.nom)}</h1>
      <p class="lead muted">${esc(t.description)}</p>

      ${clivages.length ? `<div class="section-title"><h2>Questions clés</h2></div>
        ${clivages.map(tableauClivage).join('')}` : ''}

      <div class="section-title"><h2>Propositions</h2><span class="count">${props.length}</span></div>
      ${props.length
        ? `<div class="grid cols-2">${props.map((p) => propCard(p, true)).join('')}</div>`
        : `<div class="empty-state">Aucune proposition sourcée sur ce thème pour l'instant.</div>`}`;
  }

  function tableauClivage(cl) {
    const rows = Object.entries(cl.positions || {}).map(([cid, pos]) => {
      const c = byId(DB.candidats, cid);
      const opt = cl.options.find((o) => o.id === pos.option);
      const p = pos.proposition ? byId(DB.propositions, pos.proposition) : null;
      return `<tr>
        <th class="rowhead" scope="row"><span class="dot" style="--c:${esc(c ? c.couleur : '#999')};display:inline-block;margin-right:7px"></span>${esc(c ? c.nom : cid)}</th>
        <td>${esc(opt ? opt.label : '—')}</td>
        <td class="small">${p && p.sources && p.sources[0] ? `<a href="${esc(p.sources[0].url)}" target="_blank" rel="noopener noreferrer">${esc(p.sources[0].editeur || 'source')}</a>` : '<span class="muted">—</span>'}</td>
      </tr>`;
    });
    const sansPosition = DB.candidats.filter((c) => c.statut !== 'retire' && !(cl.positions || {})[c.id]).length;

    return `<div class="card stack" style="margin-bottom:16px">
      <h3 style="margin:0">${esc(cl.question)}</h3>
      ${rows.length ? `<div class="table-scroll"><table>
        <thead><tr><th>Candidat</th><th>Position documentée</th><th>Source</th></tr></thead>
        <tbody>${rows.join('')}</tbody></table></div>`
        : `<p class="muted">Aucune position documentée pour l'instant.</p>`}
      <p class="muted small" style="margin:0">${sansPosition} candidat${sansPosition > 1 ? 's' : ''} sans position publique documentée sur cette question.</p>
    </div>`;
  }

  function vueComparateur(query) {
    const preselect = (query.get('c') || '').split(',').filter(Boolean);
    const eligibles = DB.candidats.filter((c) => c.statut !== 'retire');
    const selected = new Set(preselect.length ? preselect : DB.candidats.filter((c) => propsFor(c.id).length > 0).slice(0, 3).map((c) => c.id));

    const html = `
      <h1>Comparateur</h1>
      <p class="lead muted">Sélectionnez les candidats à mettre côte à côte. Le tableau n'affiche que des positions sourcées ; une case vide signifie « aucune position publique documentée à ce jour ».</p>
      <fieldset>
        <legend>Candidats (6 maximum)</legend>
        <div class="checks" id="cmpChecks">
          ${eligibles.map((c) => `<label class="check">
            <input type="checkbox" value="${esc(c.id)}" ${selected.has(c.id) ? 'checked' : ''}>
            <span class="dot" style="--c:${esc(c.couleur || '#999')}"></span>
            <span>${esc(c.nom)} <span class="muted small">${esc(c.parti)}</span></span>
          </label>`).join('')}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="cmpClear">Tout décocher</button>
          <button class="btn" id="cmpDocumented">Ceux qui ont des données</button>
        </div>
      </fieldset>
      <div id="cmpOut"></div>`;

    setTimeout(() => {
      const box = document.getElementById('cmpChecks');
      const out = document.getElementById('cmpOut');
      if (!box) return;
      const render = () => {
        const ids = [...box.querySelectorAll('input:checked')].map((i) => i.value).slice(0, 6);
        out.innerHTML = ids.length < 1
          ? `<div class="empty-state">Sélectionnez au moins un candidat.</div>`
          : tableauComparatif(ids);
        const q = new URLSearchParams(); if (ids.length) q.set('c', ids.join(','));
        history.replaceState(null, '', `#/comparateur${ids.length ? '?' + q : ''}`);
      };
      box.addEventListener('change', render);
      document.getElementById('cmpClear').onclick = () => { box.querySelectorAll('input').forEach((i) => (i.checked = false)); render(); };
      document.getElementById('cmpDocumented').onclick = () => {
        box.querySelectorAll('input').forEach((i) => (i.checked = propsFor(i.value).length > 0));
        render();
      };
      render();
    }, 0);

    return html;
  }

  function tableauComparatif(ids) {
    const cands = ids.map((id) => byId(DB.candidats, id)).filter(Boolean);
    const blocs = DB.themes.map((t) => {
      const cells = cands.map((c) => {
        const ps = propsFor(c.id).filter((p) => p.theme === t.id);
        if (!ps.length) return `<td class="empty">Non documenté</td>`;
        return `<td><ul class="clean">${ps.map((p) => `<li><strong>${esc(p.titre)}</strong>${p.chiffrage ? `<br><span class="chiffrage">${esc(p.chiffrage)}</span>` : ''}${p.sources && p.sources[0] ? `<br><a class="small" href="${esc(p.sources[0].url)}" target="_blank" rel="noopener noreferrer">source ↗</a>` : ''}</li>`).join('')}</ul></td>`;
      });
      if (cells.every((c) => c.includes('Non documenté'))) return '';
      return `<tr><th class="rowhead" scope="row">${esc(t.icone)} ${esc(t.nom)}</th>${cells.join('')}</tr>`;
    }).filter(Boolean);

    const vides = DB.themes.length - blocs.length;

    return `<div class="table-scroll"><table>
        <thead><tr><th>Thème</th>${cands.map((c) => `<th><span class="dot" style="--c:${esc(c.couleur)};display:inline-block;margin-right:6px"></span>${esc(c.nom)}<br><span class="muted small" style="font-weight:400;text-transform:none;letter-spacing:0">${esc(c.parti)}</span></th>`).join('')}</tr></thead>
        <tbody>${blocs.join('') || `<tr><td colspan="${cands.length + 1}" class="empty">Aucune donnée pour cette sélection.</td></tr>`}</tbody>
      </table></div>
      ${vides ? `<p class="muted small" style="margin-top:10px">${vides} thème${vides > 1 ? 's' : ''} masqué${vides > 1 ? 's' : ''} : aucun des candidats sélectionnés n'y a de position documentée.</p>` : ''}`;
  }

  function vueConvergences() {
    const actifs = DB.candidats.filter((c) => DB.clivages.some((cl) => cl.positions && cl.positions[c.id]));

    // matrice de convergence
    const paire = (a, b) => {
      let communs = 0, accords = 0;
      DB.clivages.forEach((cl) => {
        const pa = cl.positions?.[a.id], pb = cl.positions?.[b.id];
        if (pa && pb) { communs++; if (pa.option === pb.option) accords++; }
      });
      return { communs, accords };
    };

    const matrice = `<div class="table-scroll"><table class="matrix">
      <thead><tr><th>Convergence</th>${actifs.map((c) => `<th>${esc(c.nom.split(' ').slice(-1)[0])}</th>`).join('')}</tr></thead>
      <tbody>${actifs.map((a) => `<tr><th class="rowhead" scope="row"><span class="dot" style="--c:${esc(a.couleur)};display:inline-block;margin-right:6px"></span>${esc(a.nom)}</th>${
        actifs.map((b) => {
          if (a.id === b.id) return `<td class="cell muted">—</td>`;
          const { communs, accords } = paire(a, b);
          if (!communs) return `<td class="cell muted" title="Aucune question clé documentée pour les deux">n/a</td>`;
          const pct = Math.round((accords / communs) * 100);
          const cls = pct >= 66 ? 'ok' : pct <= 33 ? 'diff' : 'warn';
          return `<td class="cell"><span class="badge ${cls}" title="${accords} accord(s) sur ${communs} question(s) communes">${pct}%</span></td>`;
        }).join('')}</tr>`).join('')}</tbody></table></div>`;

    // accords / désaccords détaillés
    const accords = [], desaccords = [], flous = [];
    DB.clivages.forEach((cl) => {
      const entries = Object.entries(cl.positions || {});
      if (entries.length < 2) { flous.push(cl); return; }
      const groupes = {};
      entries.forEach(([cid, p]) => { (groupes[p.option] ||= []).push(cid); });
      Object.entries(groupes).forEach(([opt, cids]) => {
        if (cids.length >= 2) accords.push({ cl, opt, cids });
      });
      if (Object.keys(groupes).length >= 2) desaccords.push({ cl, groupes });
    });

    const nomsDe = (cids) => cids.map((id) => byId(DB.candidats, id)?.nom || id).join(', ');
    const labelOpt = (cl, opt) => cl.options.find((o) => o.id === opt)?.label || opt;

    return `<h1>Accords &amp; désaccords</h1>
      <p class="lead muted">Cette page compare les candidats sur des <strong>questions clés</strong> : des choix binaires ou à options limitées, où une position documentée peut être rangée sans interprétation abusive. Le pourcentage de convergence ne porte que sur les questions où <em>les deux</em> candidats ont une position sourcée.</p>

      <div class="notice small"><strong>Ce que ce chiffre n'est pas.</strong> Un taux de convergence élevé ne veut pas dire « même projet ». Deux candidats peuvent converger sur un objectif et diverger radicalement sur les moyens, le calendrier ou le financement. À ce stade de la campagne, le nombre de questions documentées est faible : lisez le détail plutôt que le pourcentage.</div>

      <div class="section-title"><h2>Matrice de convergence</h2><span class="count">${DB.clivages.length} questions clés</span></div>
      ${actifs.length >= 2 ? matrice : `<div class="empty-state">Pas encore assez de positions documentées pour construire une matrice.</div>`}

      <div class="section-title"><h2>Points d'accord</h2><span class="count">${accords.length}</span></div>
      ${accords.length ? `<div class="grid cols-2">${accords.map(({ cl, opt, cids }) => `<div class="card">
          <div class="row" style="margin-bottom:6px">${badge(themeOf(cl.theme).nom)}${badge('Accord', 'ok')}</div>
          <h3>${esc(cl.question)}</h3>
          <p><strong>${esc(labelOpt(cl, opt))}</strong></p>
          <p class="muted small">${esc(nomsDe(cids))}</p>
          <p class="small"><a href="#/theme/${esc(cl.theme)}">Voir le détail et les sources →</a></p>
        </div>`).join('')}</div>` : `<div class="empty-state">Aucun accord documenté entre au moins deux candidats pour l'instant.</div>`}

      <div class="section-title"><h2>Points de désaccord</h2><span class="count">${desaccords.length}</span></div>
      ${desaccords.length ? `<div class="grid cols-2">${desaccords.map(({ cl, groupes }) => `<div class="card">
          <div class="row" style="margin-bottom:6px">${badge(themeOf(cl.theme).nom)}${badge('Désaccord', 'diff')}</div>
          <h3>${esc(cl.question)}</h3>
          <ul class="clean">${Object.entries(groupes).map(([opt, cids]) => `<li><strong>${esc(labelOpt(cl, opt))}</strong><br><span class="muted small">${esc(nomsDe(cids))}</span></li>`).join('')}</ul>
          <p class="small" style="margin-top:10px"><a href="#/theme/${esc(cl.theme)}">Voir le détail et les sources →</a></p>
        </div>`).join('')}</div>` : `<div class="empty-state">Aucun désaccord documenté pour l'instant.</div>`}

      <div class="section-title"><h2>Zones de flou</h2><span class="count">${flous.length}</span></div>
      <p class="muted">Questions clés sur lesquelles moins de deux candidats ont une position publique documentée. C'est souvent l'information la plus utile pour un électeur.</p>
      ${flous.length ? `<div class="card"><ul class="clean">${flous.map((cl) => `<li><strong>${esc(cl.question)}</strong> <span class="muted small">— ${esc(themeOf(cl.theme).nom)} · ${Object.keys(cl.positions || {}).length} position(s) documentée(s)</span></li>`).join('')}</ul></div>` : ''}
    `;
  }

  function vueMethodologie() {
    const m = DB.meta;
    const parVerif = ['source-primaire', 'source-media', 'a-verifier'].map((k) => {
      const n = DB.propositions.filter((p) => p.statut_verification === k).length;
      const pct = DB.propositions.length ? Math.round((n / DB.propositions.length) * 100) : 0;
      return `<li><strong>${esc(VERIF[k].label)}</strong> — ${n} (${pct} %)<div class="bar"><i style="width:${pct}%"></i></div><span class="muted small">${esc(VERIF[k].desc)}</span></li>`;
    }).join('');

    return `<h1>Méthodologie</h1>
      <p class="lead muted">Ce site est un projet ouvert. Tout ce qu'il affiche est vérifiable, et tout ce qu'il ne sait pas est signalé comme tel.</p>

      <div class="section-title"><h2>Règles de publication</h2></div>
      <div class="card stack">
        <p><strong>1. Rien sans source.</strong> Aucune proposition n'est publiée sans au moins une source vérifiable, avec son URL, son éditeur et la date de consultation. Les sources officielles (site de campagne, document programmatique, profession de foi) priment sur les sources média.</p>
        <p><strong>2. Le vide est une information.</strong> Une case « non documenté » signifie qu'aucune position publique sourcée n'a été trouvée. Elle ne signifie jamais que le candidat n'a pas d'avis, et n'est jamais comblée par déduction ou par extrapolation à partir de son parti.</p>
        <p><strong>3. Pas de reformulation orientée.</strong> Les résumés reprennent le vocabulaire du candidat. Quand la formulation est disputée ou porteuse d'enjeu, la citation textuelle est affichée à côté du résumé.</p>
        <p><strong>4. Pas d'évaluation.</strong> Ce site ne dit pas si une mesure est bonne, réaliste ou finçable. Il ne note pas les candidats et n'émet aucune recommandation de vote. Le chiffrage affiché est celui annoncé par le candidat, pas une estimation indépendante.</p>
        <p><strong>5. Traitement symétrique.</strong> Tous les candidats sont soumis aux mêmes règles, au même niveau de détail et au même degré d'exigence sur les sources, sans exception liée à leur position dans les sondages ou à leur famille politique.</p>
        <p><strong>6. Traçabilité.</strong> Toutes les données vivent dans des fichiers JSON versionnés sur GitHub. Chaque modification est un commit horodaté, publiquement consultable et réversible.</p>
      </div>

      <div class="section-title"><h2>Niveaux de vérification</h2></div>
      <div class="card"><ul class="clean">${parVerif}</ul></div>

      <div class="section-title"><h2>Questions clés et convergences</h2></div>
      <div class="card stack">
        <p>Les comparaisons chiffrées reposent sur des « questions clés » : des choix à options limitées, formulés de façon à ce qu'un lecteur puisse vérifier lui-même le classement à partir de la source citée. Un candidat n'est rangé dans une option que si un document ou un propos explicite le permet.</p>
        <p>Le taux de convergence entre deux candidats est le nombre de questions où ils choisissent la même option, divisé par le nombre de questions où <em>tous les deux</em> ont une position documentée. Tant que ce dénominateur est faible, le pourcentage est fragile — il est affiché avec son détail pour cette raison.</p>
      </div>

      <div class="section-title"><h2>Limites assumées</h2></div>
      <div class="card stack">
        <p>Le classement par famille politique (gauche, centre, droite…) est une convention de présentation reprise des rédactions parlementaires. Elle est contestable et contestée ; elle n'intervient dans aucun calcul.</p>
        <p>La sélection des thèmes et des questions clés est un choix éditorial. Il oriente la comparaison. Toute proposition d'ajout, de reformulation ou de retrait est bienvenue via un ticket public.</p>
        <p>Le corpus est incomplet et le restera tant que les programmes ne seront pas publiés. À ${fmtDate(m.derniere_mise_a_jour)}, l'essentiel des candidats n'a diffusé que des orientations.</p>
      </div>

      <div class="section-title"><h2>Corriger une erreur</h2></div>
      <div class="card">
        <p>Une donnée fausse, une source périmée, une citation tronquée, un candidat manquant : <a href="${esc(m.depot)}/issues/new/choose">ouvrez un ticket</a> ou proposez directement une modification du fichier JSON concerné. Les corrections accompagnées d'une source officielle sont traitées en priorité.</p>
        <p class="muted small">Données : ${esc(m.licence_donnees)} · Code : ${esc(m.licence_code)} · Version des données : ${esc(m.version_donnees)} · Dernière mise à jour : ${fmtDate(m.derniere_mise_a_jour)}</p>
      </div>`;
  }

  /* ---------- routage ---------- */

  function route() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = raw.split('?');
    const query = new URLSearchParams(qs || '');
    const seg = path.split('/').filter(Boolean);

    let html, active = '';
    switch (seg[0]) {
      case undefined: html = vueAccueil(); break;
      case 'candidats': html = vueCandidats(); active = 'candidats'; break;
      case 'candidat': html = vueCandidat(seg[1]); active = 'candidats'; break;
      case 'themes': html = vueThemes(); active = 'themes'; break;
      case 'theme': html = vueTheme(seg[1]); active = 'themes'; break;
      case 'comparateur': html = vueComparateur(query); active = 'comparateur'; break;
      case 'convergences': html = vueConvergences(); active = 'convergences'; break;
      case 'methodologie': html = vueMethodologie(); active = 'methodologie'; break;
      default: html = `<div class="empty-state">Page introuvable. <a href="#/">Retour à l'accueil</a></div>`;
    }

    app.innerHTML = html;
    document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === active));
    document.getElementById('mainNav')?.classList.remove('open');
    document.getElementById('navToggle')?.setAttribute('aria-expanded', 'false');
    if (!seg.length) window.scrollTo({ top: 0 });
  }

  /* ---------- démarrage ---------- */

  async function boot() {
    try {
      const [meta, themes, candidats, propositions, clivages] = await Promise.all(
        ['meta', 'themes', 'candidats', 'propositions', 'clivages'].map((f) =>
          fetch(`data/${f}.json`, { cache: 'no-cache' }).then((r) => {
            if (!r.ok) throw new Error(`data/${f}.json → HTTP ${r.status}`);
            return r.json();
          })
        )
      );
      Object.assign(DB, { meta, themes, candidats, propositions, clivages });

      const fm = document.getElementById('footerMeta');
      if (fm) fm.textContent = `Dernière mise à jour des données : ${fmtDate(meta.derniere_mise_a_jour)} · version ${meta.version_donnees}`;
      if (meta.depot) {
        document.getElementById('repoLink').href = meta.depot;
        document.getElementById('issueLink').href = `${meta.depot}/issues/new/choose`;
      }

      window.addEventListener('hashchange', route);
      route();
    } catch (e) {
      app.innerHTML = `<div class="empty-state">
        <p><strong>Impossible de charger les données.</strong></p>
        <p class="small">${esc(e.message)}</p>
        <p class="small muted">Si vous ouvrez ce fichier directement depuis le disque, lancez plutôt un serveur local :
        <code>python3 -m http.server</code> puis ouvrez <code>http://localhost:8000</code>.</p>
      </div>`;
    }
  }

  document.getElementById('navToggle')?.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    const open = nav.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });

  boot();
})();
