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
    if (parts.length === 3) return `${Number(parts[2]) === 1 ? '1er' : Number(parts[2])} ${mois[Number(parts[1]) - 1]} ${parts[0]}`;
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

  /* Le statut porte le même signe partout : carré plein (déclaré), demi-carré
     (sous conditions), carré vide (pressenti), carré barré (retiré). */
  const signe = (statut) => `<i class="st ${esc(STATUTS[statut] ? statut : 'pressenti')}" aria-hidden="true"></i>`;
  const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  const nProps = (n) => `${pluriel(n, 'proposition')} référencée${n > 1 ? 's' : ''}`;

  const propsFor = (candidatId) => DB.propositions.filter((p) => p.candidat === candidatId);
  const themeOf = (id) => byId(DB.themes, id) || { id, nom: id, icone: '•' };

  /* ---------- composants ---------- */

  function candCard(c) {
    const st = STATUTS[c.statut] || STATUTS.pressenti;
    const ep = ETATS_PROGRAMME[c.etat_programme] || ETATS_PROGRAMME['aucun-publie-2027'];
    const n = propsFor(c.id).length;
    return `<a class="cand-card" href="#/candidat/${esc(c.id)}">
      <h3>${esc(c.nom)}</h3>
      <div class="parti">${esc(c.parti)}</div>
      <div class="etat">
        <span>${signe(c.statut)}${esc(st.label)}</span>
        <span>${esc(ep.label)}</span>
        <span>${n ? nProps(n) : 'Aucune proposition référencée'}</span>
      </div>
    </a>`;
  }

  function propCard(p, withCandidat = false) {
    const v = VERIF[p.statut_verification] || VERIF['a-verifier'];
    const c = byId(DB.candidats, p.candidat);
    return `<article class="prop">
      <div class="row between">
        <span class="badge plain">${esc(themeOf(p.theme).nom)}</span>
        ${badge(v.label, v.cls, v.desc)}
      </div>
      <h4>${esc(p.titre)}</h4>
      ${withCandidat && c ? `<p class="qui"><a href="#/candidat/${esc(c.id)}">${esc(c.nom)}</a>, ${esc(c.parti)}</p>` : ''}
      <p>${esc(p.resume)}</p>
      ${p.citation ? `<blockquote class="quote">« ${esc(p.citation)} »</blockquote>` : ''}
      ${p.chiffrage ? `<span class="chiffrage">${esc(p.chiffrage)}</span>` : ''}
      ${sourcesHtml(p.sources)}
    </article>`;
  }

  /* ---------- vues ---------- */

  /* ---------- calendrier du scrutin ---------- */

  const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const fmtCourt = (iso) => {
    const [a, m, j] = iso.split('-').map(Number);
    return `${j === 1 ? '1er' : j} ${MOIS_COURTS[m - 1]} ${a}`;
  };
  /* Le compte à rebours se lit sur l'horloge de Paris : on compare deux heures
     murales, pour que le passage à l'heure d'été ne retire pas une heure. */
  const murParis = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  };
  const aujourdhuiIso = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
  const joursAvant = (iso) => Math.round((Date.parse(iso) - Date.parse(aujourdhuiIso())) / 86400000);

  function etapes() {
    const liste = (DB.meta.election.calendrier || []).slice();
    const today = aujourdhuiIso();
    let prochaineVue = false;
    return liste.map((e) => {
      const faite = !!e.date && e.date < today;
      const prochaine = !!e.date && !faite && !prochaineVue;
      if (prochaine) prochaineVue = true;
      return { ...e, faite, prochaine };
    });
  }

  function carteElectorale() {
    const garder = ['dates-annoncees', 'parrainages', 'liste-officielle', 'campagne-1', 'tour-1', 'tour-2'];
    const cases = etapes().filter((e) => garder.includes(e.id));
    return `<aside class="carte" aria-labelledby="carteTitre">
      <div class="carte-head">
        <h2 id="carteTitre">Avant le premier tour</h2>
        <a href="#/calendrier">Tout le calendrier</a>
      </div>
      <div class="rebours" id="rebours" role="timer" aria-live="off"></div>
      <p class="rebours-legende">jusqu'au dimanche ${fmtDate(DB.meta.election.premier_tour)}, minuit à Paris.</p>
      <ol class="cases">
        ${cases.map((e) => `<li class="case${e.faite ? ' faite' : ''}${e.prochaine ? ' prochaine' : ''}">
          <span class="quoi">${esc(e.court || e.titre)}</span>
          <span class="quand">${e.au_plus_tard ? 'au plus tard le ' : ''}${fmtCourt(e.date)}</span>
          ${e.faite ? `<span class="tampon" aria-label="Étape passée">${fmtCourt(e.date).replace(/ (\d{4})$/, '<br>$1')}</span>` : ''}
        </li>`).join('')}
      </ol>
    </aside>`;
  }

  let minuterie = null;
  function lancerRebours() {
    clearInterval(minuterie);
    const el = document.getElementById('rebours');
    if (!el) return;
    const cible = Date.parse(DB.meta.election.premier_tour);
    const deux = (n) => String(n).padStart(2, '0');
    const tic = () => {
      if (!el.isConnected) { clearInterval(minuterie); return; }
      const reste = Math.max(0, cible - murParis());
      const j = Math.floor(reste / 86400000);
      const h = Math.floor(reste / 3600000) % 24;
      const m = Math.floor(reste / 60000) % 60;
      const sec = Math.floor(reste / 1000) % 60;
      el.innerHTML = `<div><b>${j}</b><span>jour${j > 1 ? 's' : ''}</span></div>
        <div><b>${deux(h)}</b><span>h</span></div><div><b>${deux(m)}</b><span>min</span></div><div><b>${deux(sec)}</b><span>s</span></div>`;
      el.setAttribute('aria-label', `${j} jours, ${h} heures et ${m} minutes avant le premier tour`);
    };
    tic();
    minuterie = setInterval(tic, 1000);
  }

  function vueCalendrier() {
    const src = DB.meta.election.source_calendrier;
    const lignes = etapes().map((e) => {
      const d = e.date ? joursAvant(e.date) : null;
      const dans = d === null ? 'Date à venir' : d < 0 ? 'Passé' : d === 0 ? "Aujourd'hui" : `Dans ${pluriel(d, 'jour')}`;
      return `<li class="${e.faite ? 'faite' : ''}${e.prochaine ? ' prochaine' : ''}">
        <div class="quand">${e.date ? fmtDate(e.date) : 'Date non fixée'}${e.au_plus_tard ? '<small>au plus tard</small>' : ''}${e.heure ? `<small>à ${esc(e.heure.replace(':00', ' h').replace(':', ' h '))}</small>` : ''}</div>
        <div><h3>${esc(e.titre)}</h3>${e.detail ? `<p>${esc(e.detail)}</p>` : ''}</div>
        <div class="dans">${e.prochaine ? 'Prochaine étape. ' : ''}${dans}</div>
      </li>`;
    }).join('');
    return `<h1>Calendrier du scrutin</h1>
      <p class="lead">Les étapes officielles, de l'annonce des dates à la fin du mandat en cours. Tant que le Conseil constitutionnel n'a pas publié la liste des candidatures, toutes les personnes suivies ici sont des prétendants.</p>
      <ol class="frise">${lignes}</ol>
      ${src ? `<p class="sources" style="border:0">Source : <a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.titre)}</a>, ${esc(src.editeur)}, consulté le ${fmtDate(src.consulte_le)}. Ce site ne publie ni sondage ni pronostic : ce calendrier ne contient que des échéances institutionnelles.</p>` : ''}
      <div class="section-title"><h2>Les 500 parrainages</h2></div>
      <div class="card stack">
        <p>Se déclarer ne suffit pas. Pour figurer sur le bulletin, il faut réunir 500 présentations d'élus, issus d'au moins 30 départements ou collectivités, sans que plus d'un dixième provienne d'un même département.</p>
        <p>À ce jour, ${DB.candidats.filter((c) => c.statut === 'declare').length} des ${DB.candidats.length} personnes suivies sur ce site ont déclaré leur candidature. <a href="#/candidats">Voir la liste</a>.</p>
      </div>`;
  }

  /* ---------- le peloton : une case par personne suivie ---------- */

  function peloton() {
    const ordre = ['declare', 'conditionnel', 'pressenti', 'retire'];
    const libelles = { declare: 'candidatures déclarées', conditionnel: 'sous conditions', pressenti: 'pressentis, non déclarés', retire: 'retraits' };
    const groupes = ordre.map((st) => {
      const list = DB.candidats.filter((c) => c.statut === st).sort((a, b) => a.id.localeCompare(b.id, 'fr'));
      if (!list.length) return '';
      return `<div class="peloton-groupe">
        <h3><b>${list.length}</b>${esc(libelles[st])}</h3>
        <ul class="peloton-cases">${list.map((c) => {
          const n = propsFor(c.id).length;
          const txt = `${c.nom}, ${c.parti} : ${n ? nProps(n) : 'aucune proposition référencée'}`;
          return `<li><a href="#/candidat/${esc(c.id)}" class="${n ? 'doc' : ''}" data-qui="${esc(c.nom)}" data-quoi="${esc(`${c.parti} · ${n ? nProps(n) : 'aucune proposition référencée'}`)}" aria-label="${esc(txt)}">${signe(c.statut)}</a></li>`;
        }).join('')}</ul>
      </div>`;
    }).join('');
    return `<div class="peloton" id="peloton">
      <div class="peloton-groupes">${groupes}</div>
      <p class="peloton-qui" id="pelotonQui" aria-hidden="true">Passez sur une case pour voir de qui il s'agit.</p>
      <p class="peloton-legende">Une case par personne, rangée par ordre alphabétique. Un point au centre : au moins une proposition sourcée est référencée ici.</p>
    </div>`;
  }

  function brancherPeloton() {
    const box = document.getElementById('peloton');
    const out = document.getElementById('pelotonQui');
    if (!box || !out) return;
    const repos = out.textContent;
    const montrer = (e) => {
      const a = e.target.closest('a[data-qui]');
      if (!a) return;
      out.innerHTML = `<b>${esc(a.dataset.qui)}</b> ${esc(a.dataset.quoi.replace(' · ', ', '))}`;
    };
    box.addEventListener('pointerover', montrer);
    box.addEventListener('focusin', montrer);
    box.addEventListener('pointerleave', () => { out.textContent = repos; });
  }

  /* ---------- à l'aveugle : la mesure avant le nom ----------
     Le tirage se fait d'abord parmi les candidats documentés, puis parmi leurs
     propositions : chaque candidat a la même chance de sortir, quel que soit
     le nombre d'entrées qu'il a dans le dépôt (charte, règle 5). */

  let tirage = null;
  function tirer() {
    const docs = DB.candidats.filter((c) => propsFor(c.id).length > 0);
    if (!docs.length) return null;
    let p;
    do {
      const c = docs[Math.floor(Math.random() * docs.length)];
      const ps = propsFor(c.id);
      p = ps[Math.floor(Math.random() * ps.length)];
    } while (tirage && docs.length > 1 && p.id === tirage.id);
    return p;
  }

  function aveugleHtml(revele) {
    const p = tirage;
    if (!p) return `<div class="empty-state">Aucune proposition à tirer pour l'instant.</div>`;
    const c = byId(DB.candidats, p.candidat);
    return `<p class="aveugle-theme">${esc(themeOf(p.theme).nom)}</p>
      <h3>${esc(p.titre)}</h3>
      <p class="resume">${esc(p.resume)}</p>
      ${p.chiffrage ? `<span class="chiffrage">${esc(p.chiffrage)}</span>` : ''}
      <div class="aveugle-qui${revele ? ' revele' : ''}" aria-live="polite">
        ${revele && c
          ? `<span class="dot" style="--c:${esc(c.couleur || '#999')}"></span>
             <span><span class="nom">${esc(c.nom)}</span><br><span class="parti">${esc(c.parti)}</span></span>
             <a class="btn" href="#/candidat/${esc(c.id)}" style="margin-left:auto">Voir sa fiche</a>`
          : `<span class="muted">Qui propose cette mesure ?</span>`}
      </div>
      ${revele ? sourcesHtml(p.sources) : ''}
      <div class="row aveugle-actions">
        ${revele ? '' : `<button class="btn primary" type="button" data-action="reveler">Voir qui la propose</button>`}
        <button class="btn${revele ? ' primary' : ''}" type="button" data-action="tirer">Tirer une autre mesure</button>
      </div>`;
  }

  function brancherAveugle() {
    const box = document.getElementById('aveugle');
    if (!box) return;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (!b) return;
      if (b.dataset.action === 'tirer') { tirage = tirer(); box.innerHTML = aveugleHtml(false); }
      if (b.dataset.action === 'reveler') { box.innerHTML = aveugleHtml(true); }
      box.querySelector('button')?.focus();
    });
  }

  /* ---------- vues ---------- */

  function vueAccueil() {
    const m = DB.meta;
    const declares = DB.candidats.filter((c) => c.statut === 'declare');
    const documentes = DB.candidats
      .filter((c) => propsFor(c.id).length > 0)
      .sort((a, b) => a.id.localeCompare(b.id, 'fr'));
    tirage = tirer();

    return `
    <section class="hero">
      <div>
        <h1>Comparer les programmes, pas les slogans</h1>
        <p class="lead">Ce que les candidats à la présidentielle de 2027 proposent, mesure par mesure. Chaque ligne renvoie à sa source et à sa date. Vous jugez, nous documentons.</p>
        <ul class="hero-figures">
          <li><b>${DB.candidats.length}</b><span>personnes suivies</span></li>
          <li><b>${declares.length}</b><span>candidatures déclarées</span></li>
          <li><b>${DB.propositions.length}</b><span>propositions sourcées</span></li>
        </ul>
      </div>
      ${carteElectorale()}
    </section>

    <details class="notice" open>
      <summary>À lire avant tout</summary>
      <p>${esc(m.avertissement)}</p>
    </details>

    <div class="section-title"><h2>Qui est sur la ligne de départ</h2><span class="count">au ${fmtDate(m.derniere_mise_a_jour)}</span></div>
    ${peloton()}

    <div class="section-title"><h2>À l'aveugle</h2></div>
    <p class="section-intro">Une mesure tirée au sort, sans le nom de la personne qui la porte. Lisez-la d'abord, regardez ensuite qui la propose.</p>
    <div class="aveugle" id="aveugle">${aveugleHtml(false)}</div>

    <div class="section-title"><h2>Trois façons de comparer</h2></div>
    <div class="grid cols-3">
      <a class="card" href="#/comparateur">
        <h3>Comparateur</h3>
        <p class="muted">Jusqu'à six candidats côte à côte, thème par thème.</p>
      </a>
      <a class="card" href="#/convergences">
        <h3>Accords et désaccords</h3>
        <p class="muted">Où les candidats se rejoignent, où ils s'opposent, où rien n'est encore dit.</p>
      </a>
      <a class="card" href="#/themes">
        <h3>Par thème</h3>
        <p class="muted">Retraites, immigration, économie, écologie : toutes les positions connues.</p>
      </a>
    </div>

    <div class="section-title"><h2>Candidats déjà documentés</h2><span class="count">${documentes.length} sur ${DB.candidats.length}, par ordre alphabétique</span></div>
    <ul class="liste-cand">${documentes.map((c) => {
      const n = propsFor(c.id).length;
      return `<li><a href="#/candidat/${esc(c.id)}">
        <span class="nom">${signe(c.statut)}${esc(c.nom)}</span>
        <span class="parti">${esc(c.parti)}</span>
        <span class="n">${nProps(n)}</span>
      </a></li>`;
    }).join('')}</ul>
    <p style="margin-top:14px"><a href="#/candidats">Voir les ${DB.candidats.length} candidats et prétendants suivis</a></p>
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
      <p class="lead">Toute personne publiquement déclarée ou dont la candidature est activement évoquée dans la presse est listée ici, qu'elle ait ou non publié un programme. Le classement par famille politique reprend celui utilisé par les rédactions parlementaires ; il est indicatif et discutable (<a href="#/methodologie">voir la méthodologie</a>).</p>
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
        return `<li><strong>${esc(cl.question)}</strong><br><span class="muted">${esc(opt ? opt.label : 'Non documenté')}</span></li>`;
      });

    return `
      <p class="breadcrumb"><a href="#/candidats">Candidats</a> / ${esc(c.nom)}</p>
      <div class="fiche">
        <h1><span class="dot" style="--c:${esc(c.couleur || '#999')}" aria-hidden="true"></span>${esc(c.nom)}</h1>
        <p class="muted">${esc(c.parti)}${c.date_declaration ? `, candidature déclarée ${String(c.date_declaration).length > 7 ? 'le' : 'en'} ${fmtDate(c.date_declaration)}` : ''}${c.date_retrait ? `, retrait le ${fmtDate(c.date_retrait)}` : ''}</p>
        <div class="row"><span class="badge plain">${signe(c.statut)}${esc(st.label)}</span>${badge(ep.label, ep.cls)}</div>
        ${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}
        <div class="row" style="margin-top:14px">
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
            <h3 style="margin-top:1.8rem">${esc(t.nom)}</h3>
            <div class="grid cols-2">${ps.map((p) => propCard(p)).join('')}</div>`).join('')
        : `<div class="empty-state">
             <p><strong>Aucune proposition sourcée à ce jour.</strong></p>
             <p>Cela ne signifie pas que ce candidat n'a pas d'idées : aucun document programmatique public et vérifiable n'a encore été publié, ou il n'a pas encore été intégré ici. Une source à signaler ? <a href="${esc(DB.meta.depot)}/issues/new/choose">Ouvrez un ticket</a>.</p>
           </div>`}
    `;
  }

  function vueThemes() {
    return `<h1>Thèmes</h1>
      <p class="lead">Chaque thème regroupe les propositions sourcées de tous les candidats, et les questions clés qui les séparent.</p>
      <div class="grid cols-3">
        ${DB.themes.map((t) => {
          const n = DB.propositions.filter((p) => p.theme === t.id).length;
          const q = DB.clivages.filter((c) => c.theme === t.id).length;
          return `<a class="card" href="#/theme/${esc(t.id)}">
            <h3>${esc(t.nom)}</h3>
            <p class="muted">${esc(t.description)}</p>
            <p class="badge plain">${pluriel(n, 'proposition')}, ${q} question${q > 1 ? 's' : ''} clé${q > 1 ? 's' : ''}</p>
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
      <h1>${esc(t.nom)}</h1>
      <p class="lead">${esc(t.description)}</p>

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

  /* Defilement horizontal : le trackpad (deux doigts) et les molettes
     horizontales emettent deja deltaX, gere nativement par overflow-x.
     On n'ajoute que le cas d'une molette verticale seule, via Maj. */
  function enableHScroll(el) {
    if (!el || el.dataset.hscroll) return;
    el.dataset.hscroll = '1';
    el.addEventListener('wheel', (e) => {
      if (e.deltaX !== 0 || !e.shiftKey) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }, { passive: false });
  }

  function vueComparateur(query) {
    const preselect = (query.get('c') || '').split(',').filter(Boolean);
    const eligibles = DB.candidats.filter((c) => c.statut !== 'retire');
    const selected = new Set(preselect.length ? preselect : DB.candidats.filter((c) => propsFor(c.id).length > 0).slice(0, 3).map((c) => c.id));

    const html = `
      <h1>Comparateur</h1>
      <p class="lead">Sélectionnez les candidats à mettre côte à côte. Le tableau n'affiche que des positions sourcées ; une case vide signifie « aucune position publique documentée à ce jour ».</p>
      <fieldset>
        <legend>Candidats <span class="muted small" id="cmpCount"></span></legend>
        <div class="checks" id="cmpChecks">
          ${eligibles.map((c) => `<label class="check">
            <input type="checkbox" value="${esc(c.id)}" ${selected.has(c.id) ? 'checked' : ''}>
            <span class="dot" style="--c:${esc(c.couleur || '#999')}"></span>
            <span>${esc(c.nom)} <span class="muted small">${esc(c.parti)}</span></span>
          </label>`).join('')}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="cmpClear" type="button">Tout décocher</button>
          <button class="btn" id="cmpDocumented" type="button">Ceux qui ont des données</button>
        </div>
      </fieldset>
      <div id="cmpOut"></div>`;

    setTimeout(() => {
      const box = document.getElementById('cmpChecks');
      const out = document.getElementById('cmpOut');
      if (!box) return;
      const btnAll = document.getElementById('cmpClear');
      const btnDoc = document.getElementById('cmpDocumented');
      const countEl = document.getElementById('cmpCount');
      const inputs = () => [...box.querySelectorAll('input')];
      const documente = (id) => propsFor(id).length > 0;

      /* Les deux boutons sont des bascules : leur libelle decrit ce que fera
         le prochain clic, en fonction de la selection courante. */
      const syncBoutons = (ids) => {
        const total = inputs().length;
        btnAll.textContent = ids.length === 0 ? 'Tout cocher' : 'Tout décocher';
        const avecDonnees = inputs().map((i) => i.value).filter(documente);
        const estSelectionDocumentee = avecDonnees.length > 0
          && ids.length === avecDonnees.length
          && avecDonnees.every((id) => ids.includes(id));
        btnDoc.textContent = estSelectionDocumentee ? 'Ceux sans données' : 'Ceux qui ont des données';
        btnDoc.dataset.inverse = estSelectionDocumentee ? '1' : '';
        countEl.textContent = `— ${ids.length} sur ${total} sélectionné${ids.length > 1 ? 's' : ''}`;
      };

      const render = () => {
        const ids = inputs().filter((i) => i.checked).map((i) => i.value);
        out.innerHTML = ids.length < 1
          ? `<div class="empty-state">Sélectionnez au moins un candidat.</div>`
          : tableauComparatif(ids);
        syncBoutons(ids);
        const q = new URLSearchParams(); if (ids.length) q.set('c', ids.join(','));
        history.replaceState(null, '', `#/comparateur${ids.length ? '?' + q : ''}`);
        enableHScroll(out.querySelector('.table-scroll'));
      };

      box.addEventListener('change', render);

      btnAll.onclick = () => {
        const rienCoche = inputs().every((i) => !i.checked);
        inputs().forEach((i) => (i.checked = rienCoche));
        render();
      };

      btnDoc.onclick = () => {
        const inverse = btnDoc.dataset.inverse === '1';
        inputs().forEach((i) => (i.checked = inverse ? !documente(i.value) : documente(i.value)));
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
      return `<tr><th class="rowhead" scope="row">${esc(t.nom)}</th>${cells.join('')}</tr>`;
    }).filter(Boolean);

    const vides = DB.themes.length - blocs.length;

    return `${cands.length > 4 ? `<p class="muted small" style="margin:0 0 8px">${cands.length} colonnes. Défilement horizontal : deux doigts sur le trackpad, molette horizontale, ou Maj + molette. La colonne des thèmes et la ligne des candidats restent fixes.</p>` : ''}
      <div class="table-scroll cmp"><table>
        <thead><tr><th>Thème</th>${cands.map((c) => `<th><span class="dot" style="--c:${esc(c.couleur)};display:inline-block;margin-right:6px"></span>${esc(c.nom)}<small>${esc(c.parti)}</small></th>`).join('')}</tr></thead>
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
      <p class="lead">Cette page compare les candidats sur des <strong>questions clés</strong> : des choix binaires ou à options limitées, où une position documentée peut être rangée sans interprétation abusive. Le pourcentage de convergence ne porte que sur les questions où <em>les deux</em> candidats ont une position sourcée.</p>

      <div class="notice small"><strong>Ce que ce chiffre n'est pas.</strong> Un taux de convergence élevé ne veut pas dire « même projet ». Deux candidats peuvent converger sur un objectif et diverger radicalement sur les moyens, le calendrier ou le financement. À ce stade de la campagne, le nombre de questions documentées est faible : lisez le détail plutôt que le pourcentage.</div>

      <div class="section-title"><h2>Matrice de convergence</h2><span class="count">${DB.clivages.length} questions clés</span></div>
      ${actifs.length >= 2 ? matrice : `<div class="empty-state">Pas encore assez de positions documentées pour construire une matrice.</div>`}

      <div class="section-title"><h2>Points d'accord</h2><span class="count">${accords.length}</span></div>
      ${accords.length ? `<div class="grid cols-2">${accords.map(({ cl, opt, cids }) => `<div class="card">
          <div class="row" style="margin-bottom:6px">${badge(themeOf(cl.theme).nom)}${badge('Accord', 'ok')}</div>
          <h3>${esc(cl.question)}</h3>
          <p><strong>${esc(labelOpt(cl, opt))}</strong></p>
          <p class="muted small">${esc(nomsDe(cids))}</p>
          <p class="small"><a href="#/theme/${esc(cl.theme)}">Voir le détail et les sources</a></p>
        </div>`).join('')}</div>` : `<div class="empty-state">Aucun accord documenté entre au moins deux candidats pour l'instant.</div>`}

      <div class="section-title"><h2>Points de désaccord</h2><span class="count">${desaccords.length}</span></div>
      ${desaccords.length ? `<div class="grid cols-2">${desaccords.map(({ cl, groupes }) => `<div class="card">
          <div class="row" style="margin-bottom:6px">${badge(themeOf(cl.theme).nom)}${badge('Désaccord', 'diff')}</div>
          <h3>${esc(cl.question)}</h3>
          <ul class="clean">${Object.entries(groupes).map(([opt, cids]) => `<li><strong>${esc(labelOpt(cl, opt))}</strong><br><span class="muted small">${esc(nomsDe(cids))}</span></li>`).join('')}</ul>
          <p class="small" style="margin-top:10px"><a href="#/theme/${esc(cl.theme)}">Voir le détail et les sources</a></p>
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
      <p class="lead">Ce site est un projet ouvert. Tout ce qu'il affiche est vérifiable, et tout ce qu'il ne sait pas est signalé comme tel.</p>

      <div class="section-title"><h2>Règles de publication</h2></div>
      <div class="card stack">
        <p><strong>1. Rien sans source.</strong> Aucune proposition n'est publiée sans au moins une source vérifiable, avec son URL, son éditeur et la date de consultation. Les sources officielles (site de campagne, document programmatique, profession de foi) priment sur les sources média.</p>
        <p><strong>2. Le vide est une information.</strong> Une case « non documenté » signifie qu'aucune position publique sourcée n'a été trouvée. Elle ne signifie jamais que le candidat n'a pas d'avis, et n'est jamais comblée par déduction ou par extrapolation à partir de son parti.</p>
        <p><strong>3. Pas de reformulation orientée.</strong> Les résumés reprennent le vocabulaire du candidat. Quand la formulation est disputée ou porteuse d'enjeu, la citation textuelle est affichée à côté du résumé.</p>
        <p><strong>4. Pas d'évaluation.</strong> Ce site ne dit pas si une mesure est bonne, réaliste ou finançable. Il ne note pas les candidats et n'émet aucune recommandation de vote. Le chiffrage affiché est celui annoncé par le candidat, pas une estimation indépendante.</p>
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
      case 'calendrier': html = vueCalendrier(); active = 'calendrier'; break;
      case 'methodologie': html = vueMethodologie(); active = 'methodologie'; break;
      default: html = `<div class="empty-state">Page introuvable. <a href="#/">Retour à l'accueil</a></div>`;
    }

    app.innerHTML = html;
    app.querySelectorAll('.table-scroll').forEach(enableHScroll);
    lancerRebours();
    brancherPeloton();
    brancherAveugle();
    document.querySelectorAll('#mainNav a').forEach((a) => a.classList.toggle('active', a.dataset.route === active));
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
      if (fm) fm.textContent = `Données mises à jour le ${fmtDate(meta.derniere_mise_a_jour)}, version ${meta.version_donnees}.`;
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
