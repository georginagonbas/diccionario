// Diccionario vivo: 5 palabras al día (3 en español + 2 en inglés),
// práctica con preguntas y repaso espaciado (sistema Leitner).

const STORAGE_KEY = "diccionario-vivo-v1";
const DAILY = { es: 3, en: 2 };
// Días hasta el siguiente repaso según la caja (1–5).
const INTERVALS = [0, 1, 3, 7, 14, 30];
const MAX_BOX = 5;
const QUIZ_LENGTH = 8;

const byId = Object.fromEntries(WORDS.map(w => [w.id, w]));
const $app = document.getElementById("app");

// ───────── Fechas ─────────
function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
const today = () => dayNumber();

// ───────── Estado ─────────
function freshState() {
  return { progress: {}, daily: null, streak: { last: null, count: 0 }, writings: {} };
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
  } catch {
    return freshState();
  }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ }
}
let state = load();

// ───────── Utilidades ─────────
function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// Normaliza para comparar sin tildes ni mayúsculas.
function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function speak(word) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(word.word);
  u.lang = word.lang === "es" ? "es-ES" : "en-GB";
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ───────── Repaso espaciado ─────────
const isLearned = id => Boolean(state.progress[id]);
const isDue = id => isLearned(id) && state.progress[id].due <= today();

function markLearned(id) {
  if (!state.progress[id]) {
    state.progress[id] = { box: 1, due: today() + INTERVALS[1], right: 0, wrong: 0 };
  }
  touchStreak();
  save();
}
function grade(id, correct) {
  const p = state.progress[id] || (state.progress[id] = { box: 1, due: today(), right: 0, wrong: 0 });
  if (correct) {
    p.right++;
    p.box = Math.min(MAX_BOX, p.box + 1);
  } else {
    p.wrong++;
    p.box = 1;
  }
  p.due = today() + INTERVALS[p.box];
  touchStreak();
  save();
}
function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.last === t) return;
  s.count = s.last === t - 1 ? s.count + 1 : 1;
  s.last = t;
}

// ───────── Palabras del día ─────────
function dailyWords() {
  if (state.daily && state.daily.day === today()) return state.daily.ids.map(id => byId[id]).filter(Boolean);

  const rand = seededRandom(today());
  const ids = [];
  for (const lang of ["es", "en"]) {
    const unseen = WORDS.filter(w => w.lang === lang && !isLearned(w.id));
    // Si ya has visto todas, recicla las que tienes más flojas.
    const pool = unseen.length
      ? unseen
      : WORDS.filter(w => w.lang === lang).sort((a, b) => state.progress[a.id].box - state.progress[b.id].box);
    const picked = unseen.length ? shuffle(pool, rand) : pool;
    ids.push(...picked.slice(0, DAILY[lang]).map(w => w.id));
  }
  state.daily = { day: today(), ids, index: 0, done: [] };
  save();
  return ids.map(id => byId[id]);
}

// ───────── Vista: Hoy ─────────
function renderToday() {
  const words = dailyWords();
  const d = state.daily;
  const allDone = d.done.length >= words.length;
  const due = WORDS.filter(w => isDue(w.id) && !d.ids.includes(w.id)).length;

  if (allDone && d.index >= words.length) {
    $app.innerHTML = `
      <div class="card empty">
        <p style="font-size:2.5rem;margin:0">🎉</p>
        <h2>¡Hecho por hoy!</h2>
        <p>Has aprendido ${words.length} palabras nuevas. Mañana tendrás otras ${words.length}.</p>
        ${due ? `<p>Tienes <b>${due}</b> palabra${due > 1 ? "s" : ""} pendiente${due > 1 ? "s" : ""} de repaso.</p>` : ""}
        <div class="row" style="justify-content:center;margin-top:12px">
          <button class="btn primary" data-go="practice">Practicar ahora</button>
          <button class="btn" id="review-again">Volver a ver las de hoy</button>
        </div>
      </div>`;
    $app.querySelector("[data-go]").onclick = () => show("practice");
    $app.querySelector("#review-again").onclick = () => { d.index = 0; save(); renderToday(); };
    return;
  }

  const i = Math.min(d.index, words.length - 1);
  const w = words[i];
  const done = d.done.includes(w.id);
  const writing = state.writings[w.id] || "";

  $app.innerHTML = `
    <p class="intro">${words.length} palabras para hoy: ${DAILY.es} en español y ${DAILY.en} en inglés. Primero intenta adivinar qué significa.</p>
    <div class="progress">${words.map((x, k) =>
      `<span class="${d.done.includes(x.id) ? "done" : ""}" title="${esc(x.word)}"></span>`).join("")}</div>

    <article class="card">
      <div class="word-head">
        <div>
          <div class="tags">
            <span class="tag ${w.lang}">${w.lang === "es" ? "Español" : "English"}</span>
            <span class="tag">${esc(w.register)}</span>
          </div>
          <p class="word">${esc(w.word)}</p>
          <span class="meta">${esc(w.type)} · ${i + 1} de ${words.length}</span>
        </div>
        <button class="speak" id="speak" title="Escuchar" aria-label="Escuchar pronunciación">🔊</button>
      </div>

      <div id="reveal-zone">
        ${done ? revealHtml(w) : `
          <p class="meta" style="margin-top:16px">¿Se te ocurre qué significa? Piénsalo un segundo…</p>
          <button class="btn primary" id="reveal">Ver significado</button>`}
      </div>

      ${done ? challengeHtml(w, writing) : ""}

      <div class="nav-row">
        <button class="btn" id="prev" ${i === 0 ? "disabled" : ""}>← Anterior</button>
        ${done
          ? `<button class="btn primary" id="next">${i === words.length - 1 ? "Terminar" : "Siguiente →"}</button>`
          : ""}
      </div>
    </article>`;

  $app.querySelector("#speak").onclick = () => speak(w);
  $app.querySelector("#prev").onclick = () => { d.index = i - 1; save(); renderToday(); };
  const reveal = $app.querySelector("#reveal");
  if (reveal) reveal.onclick = () => {
    if (!d.done.includes(w.id)) d.done.push(w.id);
    markLearned(w.id);
    renderToday();
    updateStats();
  };
  const next = $app.querySelector("#next");
  if (next) next.onclick = () => { d.index = i + 1; save(); renderToday(); };
  bindChallenge(w);
}

function revealHtml(w) {
  const other = w.lang === "es" ? "En inglés" : "En español";
  return `
    <div class="reveal">
      <div><h3>Significado</h3><p>${esc(w.def)}</p></div>
      <div><h3>${other}</h3><p>${esc(w.gloss)}</p></div>
      <div><h3>Ejemplo</h3><p class="example">${esc(w.example)}</p></div>
      <div><h3>Sube de nivel</h3>
        <div class="upgrade">
          <span class="before">${esc(w.upgrade[0])}</span>
          <span class="after">${esc(w.upgrade[1])}</span>
        </div>
      </div>
      <div><h3>Palabras cercanas</h3><div class="chips">${w.synonyms.map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>
      <div class="tip">💡 ${esc(w.tip)}</div>
    </div>`;
}

function challengeHtml(w, writing) {
  const prompt = w.lang === "es"
    ? `Reto: escribe una frase tuya con «${esc(w.word)}» sobre algo de tu vida.`
    : `Challenge: write your own sentence using “${esc(w.word)}” about something in your life.`;
  return `
    <div class="challenge card" style="margin:16px 0 0;box-shadow:none;background:var(--surface-2)">
      <h3 style="margin:0;font-size:.95rem">✍️ ${prompt}</h3>
      <textarea id="writing" placeholder="${w.lang === "es" ? "Tu frase…" : "Your sentence…"}">${esc(writing)}</textarea>
      <div class="row"><button class="btn" id="check">Guardar frase</button><span id="fb" class="feedback"></span></div>
    </div>`;
}

function bindChallenge(w) {
  const btn = $app.querySelector("#check");
  if (!btn) return;
  btn.onclick = () => {
    const text = $app.querySelector("#writing").value.trim();
    const fb = $app.querySelector("#fb");
    // Acepta formas derivadas comparando la raíz (p. ej. «matizó», «refined»).
    const stem = norm(w.word).slice(0, Math.max(4, w.word.length - 2));
    if (!text) {
      fb.className = "feedback bad"; fb.textContent = "Escribe algo primero 🙂";
    } else if (!norm(text).includes(stem)) {
      fb.className = "feedback bad"; fb.textContent = `No veo «${w.word}» en tu frase.`;
    } else {
      state.writings[w.id] = text;
      save();
      fb.className = "feedback ok"; fb.textContent = "¡Guardada! La verás en «Mi léxico».";
    }
  };
}

// ───────── Vista: Practicar ─────────
let quiz = null;

function buildQuestion(w, rand) {
  const sameLang = WORDS.filter(x => x.lang === w.lang && x.id !== w.id);
  const distractors = shuffle(sameLang, rand).slice(0, 3);
  const kinds = ["def", "cloze", "upgrade", "gloss"];
  const kind = kinds[Math.floor(rand() * kinds.length)];

  if (kind === "gloss") {
    return {
      word: w,
      prompt: `¿Qué significa <b>${esc(w.word)}</b>?`,
      label: w.lang === "es" ? "In English" : "En español",
      options: shuffle([w, ...distractors], rand).map(x => ({ id: x.id, text: x.gloss })),
    };
  }
  const options = shuffle([w, ...distractors], rand).map(x => ({ id: x.id, text: x.word }));
  if (kind === "def") {
    return { word: w, label: "¿Qué palabra es?", prompt: esc(w.def), options };
  }
  if (kind === "cloze") {
    return {
      word: w, label: "Completa la frase",
      prompt: esc(w.cloze).replace("___", '<span class="blank">&nbsp;</span>'), options,
    };
  }
  return {
    word: w, label: "Sube de nivel: ¿qué palabra usarías?",
    prompt: `«${esc(w.upgrade[0])}»`, options,
  };
}

function startQuiz() {
  // Prioridad: palabras pendientes de repaso, luego las más flojas, luego las del día.
  const learned = WORDS.filter(w => isLearned(w.id));
  let pool = learned
    .sort((a, b) => (isDue(b.id) - isDue(a.id)) || (state.progress[a.id].box - state.progress[b.id].box));
  if (pool.length < 4) pool = [...pool, ...dailyWords().filter(w => !pool.includes(w))];
  const chosen = shuffle(pool.slice(0, QUIZ_LENGTH * 2)).slice(0, QUIZ_LENGTH);
  const rand = Math.random;
  quiz = { questions: chosen.map(w => buildQuestion(w, rand)), i: 0, score: 0, answered: false, misses: [] };
}

function renderPractice() {
  const learnedCount = Object.keys(state.progress).length;
  if (!quiz) {
    const due = WORDS.filter(w => isDue(w.id)).length;
    $app.innerHTML = `
      <div class="card">
        <h2 style="margin-top:0">Practicar</h2>
        <p>Preguntas rápidas con las palabras que ya has visto: definiciones, huecos en frases, traducciones y «sube de nivel».</p>
        <p class="meta">${learnedCount ? `Has visto ${learnedCount} palabra${learnedCount > 1 ? "s" : ""}. ${due ? `${due} toca${due > 1 ? "n" : ""} repasar hoy.` : "Ninguna pendiente de repaso hoy."}` : "Todavía no has visto ninguna: usaremos las de hoy."}</p>
        <button class="btn primary" id="start">Empezar (${Math.min(QUIZ_LENGTH, Math.max(learnedCount, DAILY.es + DAILY.en))} preguntas)</button>
      </div>`;
    $app.querySelector("#start").onclick = () => { startQuiz(); renderPractice(); };
    return;
  }

  if (quiz.i >= quiz.questions.length) {
    const n = quiz.questions.length;
    $app.innerHTML = `
      <div class="card empty">
        <p class="score">${quiz.score}/${n}</p>
        <p>${quiz.score === n ? "¡Perfecto! 🎯" : quiz.score >= n * 0.7 ? "¡Muy bien! 💪" : "Vas por buen camino. Las falladas volverán pronto."}</p>
        ${quiz.misses.length ? `<p class="meta">Para repasar: ${quiz.misses.map(w => `<b>${esc(w.word)}</b>`).join(", ")}</p>` : ""}
        <div class="row" style="justify-content:center">
          <button class="btn primary" id="again">Otra ronda</button>
          <button class="btn" id="exit">Salir</button>
        </div>
      </div>`;
    $app.querySelector("#again").onclick = () => { startQuiz(); renderPractice(); };
    $app.querySelector("#exit").onclick = () => { quiz = null; renderPractice(); };
    return;
  }

  const q = quiz.questions[quiz.i];
  $app.innerHTML = `
    <div class="progress">${quiz.questions.map((_, k) => `<span class="${k < quiz.i ? "done" : ""}"></span>`).join("")}</div>
    <div class="card">
      <div class="tags"><span class="tag ${q.word.lang}">${q.word.lang === "es" ? "Español" : "English"}</span><span class="tag">${esc(q.label)}</span></div>
      <p class="question">${q.prompt}</p>
      <div class="options">${q.options.map(o => `<button class="option" data-id="${o.id}">${esc(o.text)}</button>`).join("")}</div>
      <div id="after"></div>
    </div>`;

  $app.querySelectorAll(".option").forEach(btn => {
    btn.onclick = () => {
      if (quiz.answered) return;
      quiz.answered = true;
      const correct = btn.dataset.id === q.word.id;
      if (correct) quiz.score++; else quiz.misses.push(q.word);
      grade(q.word.id, correct);
      updateStats();
      $app.querySelectorAll(".option").forEach(b => {
        b.disabled = true;
        if (b.dataset.id === q.word.id) b.classList.add("correct");
        else if (b === btn) b.classList.add("wrong");
      });
      $app.querySelector("#after").innerHTML = `
        <div class="reveal">
          <p class="${correct ? "feedback ok" : "feedback bad"}" style="font-size:1rem">
            ${correct ? "¡Correcto!" : `Era <b>${esc(q.word.word)}</b>.`}
          </p>
          <p class="example">${esc(q.word.example)}</p>
        </div>
        <div class="nav-row"><span></span><button class="btn primary" id="next-q">Siguiente →</button></div>`;
      $app.querySelector("#next-q").onclick = () => { quiz.i++; quiz.answered = false; renderPractice(); };
    };
  });
}

// ───────── Vista: Mi léxico ─────────
let lexFilter = { q: "", lang: "all" };

function renderLexicon() {
  const learned = WORDS.filter(w => isLearned(w.id));
  if (!learned.length) {
    $app.innerHTML = `<div class="card empty"><p>Aún no tienes palabras. Empieza en <b>Hoy</b> 👆</p></div>`;
    return;
  }
  $app.innerHTML = `
    <p class="intro">Las palabras que has aprendido. Los puntos verdes indican lo asentada que está cada una.</p>
    <div class="filters">
      <input id="lex-q" type="search" placeholder="Buscar…" value="${esc(lexFilter.q)}">
      <select id="lex-lang">
        <option value="all">Todas</option>
        <option value="es" ${lexFilter.lang === "es" ? "selected" : ""}>Español</option>
        <option value="en" ${lexFilter.lang === "en" ? "selected" : ""}>English</option>
      </select>
    </div>
    <div class="lex-list" id="lex-list"></div>`;

  const draw = () => {
    const q = norm(lexFilter.q);
    const items = learned.filter(w =>
      (lexFilter.lang === "all" || w.lang === lexFilter.lang) &&
      (!q || norm(w.word + " " + w.def + " " + w.gloss).includes(q)));
    $app.querySelector("#lex-list").innerHTML = items.length ? items.map(w => {
      const p = state.progress[w.id];
      const mine = state.writings[w.id];
      return `
        <div class="lex-item">
          <div class="top">
            <span><b>${esc(w.word)}</b> <span class="tag ${w.lang}">${w.lang}</span></span>
            <span class="level" title="Nivel ${p.box} de ${MAX_BOX}">${Array.from({ length: MAX_BOX }, (_, k) => `<i class="${k < p.box ? "on" : ""}"></i>`).join("")}</span>
          </div>
          <p>${esc(w.def)}</p>
          ${mine ? `<p>✍️ <i>${esc(mine)}</i></p>` : ""}
          ${isDue(w.id) ? `<p style="color:var(--accent)">Toca repasarla</p>` : ""}
        </div>`;
    }).join("") : `<p class="empty">Nada coincide con la búsqueda.</p>`;
  };
  $app.querySelector("#lex-q").oninput = e => { lexFilter.q = e.target.value; draw(); };
  $app.querySelector("#lex-lang").onchange = e => { lexFilter.lang = e.target.value; draw(); };
  draw();
}

// ───────── Navegación ─────────
const views = { today: renderToday, practice: renderPractice, lexicon: renderLexicon };

function show(view) {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  views[view]();
  window.scrollTo({ top: 0 });
}
function updateStats() {
  const s = state.streak;
  // La racha se rompe si ayer no hubo actividad.
  const alive = s.last === today() || s.last === today() - 1;
  document.getElementById("streak").textContent = alive ? s.count : 0;
  document.getElementById("learned").textContent = Object.keys(state.progress).length;
}

document.querySelectorAll(".tabs button").forEach(b => (b.onclick = () => show(b.dataset.view)));
document.getElementById("reset").onclick = () => {
  if (!confirm("¿Seguro que quieres borrar todo tu progreso?")) return;
  state = freshState();
  quiz = null;
  save();
  updateStats();
  show("today");
};

updateStats();
show("today");
