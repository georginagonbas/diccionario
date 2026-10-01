// Diccionario vivo: 5 palabras al día (3 en español + 2 en inglés).
// Cada palabra pasa por 5 pasos basados en técnicas de aprendizaje
// (adivinar, descubrir, anclar, usar, valorar) y después se repasa con
// repetición espaciada, recuerdo activo y juegos rápidos.

const STORAGE_KEY = "diccionario-vivo-v1";
const DAILY = { es: 3, en: 2 };
// Días hasta el siguiente repaso según la caja (1–5).
const INTERVALS = [0, 1, 3, 7, 14, 30];
const MAX_BOX = 5;
const SESSION_LENGTH = 10;
const SPRINT_SECONDS = 60;
const PAIRS = 5;
const XP_PER_LEVEL = 100;

const TECHNIQUES = {
  generation: {
    name: "Efecto de generación", icon: "🔮",
    short: "Intentar adivinar antes de ver la respuesta hace que la recuerdes mejor, aunque falles.",
    long: "Cuando tu cerebro hace el esfuerzo de predecir un significado, se prepara para guardar la respuesta. Por eso cada palabra nueva empieza con un «adivina» a partir de una frase real.",
    where: "Paso 1 de cada palabra (Adivina)",
  },
  dual: {
    name: "Codificación múltiple", icon: "🎧",
    short: "Significado, ejemplo, sonido y origen: cuantas más vías, más fácil recuperarla.",
    long: "Una palabra que has leído, escuchado, visto en contexto y conectado con su origen tiene más «caminos» de vuelta en tu memoria que una definición suelta.",
    where: "Paso 2 (Descubre) y botón 🔊",
  },
  hook: {
    name: "Gancho de memoria", icon: "⚓",
    short: "Unir la palabra a una imagen o a algo que ya conoces la ancla a tu memoria.",
    long: "Es la técnica de la palabra clave que usan los campeones de memoria: un sonido parecido, una escena absurda o una persona concreta. Funciona mucho mejor si el gancho lo creas tú.",
    where: "Paso 3 (Ancla)",
  },
  production: {
    name: "Uso activo", icon: "✍️",
    short: "Escribir una frase tuya convierte vocabulario pasivo (lo entiendo) en activo (lo uso).",
    long: "Reconocer una palabra no es lo mismo que usarla. Al escribirla sobre tu propia vida la conectas con recuerdos personales, que son los más duraderos.",
    where: "Paso 4 (Úsala)",
  },
  metacognition: {
    name: "Metacognición", icon: "🧭",
    short: "Valorar lo bien que la sabes decide cuándo te la vuelve a preguntar.",
    long: "Ser consciente de lo que sabes y de lo que no es una de las habilidades que más distingue a quien aprende bien. Tu valoración ajusta el calendario de repaso.",
    where: "Paso 5 (Valora) y tras cada acierto en el repaso",
  },
  recall: {
    name: "Recuerdo activo", icon: "🧠",
    short: "Sacar la palabra de tu memoria, sin opciones, la fija mucho más que releerla.",
    long: "Es la técnica con más evidencia científica: ponerte a prueba es más eficaz que repasar apuntes. Por eso el repaso incluye preguntas donde tienes que escribir la palabra.",
    where: "Repaso inteligente (preguntas de escribir)",
  },
  spaced: {
    name: "Repetición espaciada", icon: "📅",
    short: "Repasar justo antes de olvidar: 1, 3, 7, 14 y 30 días.",
    long: "Cada acierto aleja el siguiente repaso; cada fallo lo acerca. Es el mismo principio que usa Anki. Si fallas una palabra, vuelve a salir en la misma sesión hasta que la aciertes.",
    where: "Repaso inteligente",
  },
  interleaving: {
    name: "Práctica intercalada", icon: "🔀",
    short: "Mezclar idiomas y tipos de pregunta obliga a tu cerebro a distinguir, no a repetir.",
    long: "Practicar todo mezclado parece más difícil, pero ese esfuerzo extra («dificultad deseable») hace que lo aprendido aguante más tiempo.",
    where: "Todos los modos de práctica",
  },
};

const STEPS = [
  { id: "predict", label: "Adivina", tech: "generation" },
  { id: "discover", label: "Descubre", tech: "dual" },
  { id: "hook", label: "Ancla", tech: "hook" },
  { id: "use", label: "Úsala", tech: "production" },
  { id: "rate", label: "Valora", tech: "metacognition" },
];

const byId = Object.fromEntries(WORDS.map(w => [w.id, w]));
const $app = document.getElementById("app");

// ───────── Fechas ─────────
function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
const today = () => dayNumber();

// ───────── Estado ─────────
function freshState() {
  return {
    progress: {}, daily: null, streak: { last: null, count: 0 },
    writings: {}, hooks: {}, xp: 0, best: { sprint: 0, pairs: null },
  };
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const s = { ...freshState(), ...JSON.parse(raw) };
    // Versiones anteriores guardaban el día sin «step».
    if (s.daily && !s.daily.step) s.daily = null;
    return s;
  } catch {
    return freshState();
  }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ }
}
let state = load();

// ───────── Utilidades ─────────
function hashStr(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
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
const pick = (arr, rand = Math.random) => arr[Math.floor(rand() * arr.length)];
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// Normaliza para comparar sin tildes ni mayúsculas.
function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function speak(word) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(word.word);
  u.lang = word.lang === "es" ? "es-ES" : "en-GB";
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
// Enlace a la entrada oficial: RAE para español, Cambridge para inglés.
function dictLink(w) {
  return w.lang === "es"
    ? { url: `https://dle.rae.es/${encodeURIComponent(w.word)}`, label: "Ver en la RAE" }
    : { url: `https://dictionary.cambridge.org/dictionary/english-spanish/${encodeURIComponent(w.word)}`, label: "Ver en Cambridge" };
}
function techBadge(key) {
  const t = TECHNIQUES[key];
  return `<p class="tech"><span aria-hidden="true">${t.icon}</span> <b>${t.name}.</b> ${t.short}</p>`;
}
function wordHeader(w, extra = "") {
  return `
    <div class="word-head">
      <div>
        <div class="tags">
          <span class="tag ${w.lang}">${w.lang === "es" ? "Español" : "English"}</span>
          <span class="tag">${esc(w.register)}</span>
        </div>
        <p class="word">${esc(w.word)}</p>
        <span class="meta">${esc(w.type)}${extra}</span>
      </div>
      <button class="speak" data-speak="${w.id}" title="Escuchar" aria-label="Escuchar pronunciación">🔊</button>
    </div>`;
}
function bindSpeak(root = $app) {
  root.querySelectorAll("[data-speak]").forEach(b => (b.onclick = () => speak(byId[b.dataset.speak])));
}
function highlight(sentence, w) {
  // Resalta la palabra (o una forma derivada) dentro de la frase.
  const stem = norm(w.word).slice(0, Math.max(4, w.word.length - 2));
  return esc(sentence).split(" ").map(tok => norm(tok).startsWith(stem) ? `<mark>${tok}</mark>` : tok).join(" ");
}

// ───────── Puntos de experiencia ─────────
let toastTimer;
function addXp(n, label = "") {
  if (n <= 0) return;
  const before = level();
  state.xp += n;
  save();
  updateStats();
  const up = level() > before;
  const $t = document.getElementById("toast");
  $t.innerHTML = up ? `⭐ ¡Nivel ${level()}!` : `+${n} XP${label ? ` · ${esc(label)}` : ""}`;
  $t.className = "toast show" + (up ? " levelup" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($t.className = "toast"), up ? 2200 : 1300);
}
const level = () => Math.floor(state.xp / XP_PER_LEVEL) + 1;

// ───────── Repaso espaciado ─────────
const isLearned = id => Boolean(state.progress[id]);
const isDue = id => isLearned(id) && state.progress[id].due <= today();

function addWord(id, rating) {
  // rating: "hard" | "good" | "easy"
  const box = rating === "easy" ? 2 : 1;
  const due = rating === "hard" ? today() : today() + INTERVALS[box];
  state.progress[id] = { box, due, right: 0, wrong: 0 };
  touchStreak();
  save();
}
// result: "again" | "hard" | "good" | "easy" (como en Anki)
function review(id, result) {
  const p = state.progress[id];
  if (!p) return;
  if (result === "again") {
    p.wrong++;
    p.box = 1;
    p.due = today();
  } else {
    p.right++;
    if (result === "good") p.box = Math.min(MAX_BOX, p.box + 1);
    if (result === "easy") p.box = Math.min(MAX_BOX, p.box + 2);
    p.due = today() + (result === "hard" ? Math.max(1, Math.round(INTERVALS[p.box] / 2)) : INTERVALS[p.box]);
  }
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
    const unseen = shuffle(WORDS.filter(w => w.lang === lang && !isLearned(w.id)), rand);
    // Si ya las has visto todas, recicla las más flojas.
    const weakest = WORDS.filter(w => w.lang === lang && isLearned(w.id))
      .sort((a, b) => state.progress[a.id].box - state.progress[b.id].box);
    ids.push(...[...unseen, ...weakest].slice(0, DAILY[lang]).map(w => w.id));
  }
  state.daily = { day: today(), ids, index: 0, step: "predict", guesses: {} };
  save();
  return ids.map(id => byId[id]);
}

// ───────── Vista: Hoy ─────────
function renderToday() {
  const words = dailyWords();
  const d = state.daily;
  if (d.index >= words.length) return renderDayDone(words);

  const w = words[d.index];
  const stepIdx = STEPS.findIndex(s => s.id === d.step);
  const step = STEPS[stepIdx];

  $app.innerHTML = `
    <div class="day-head">
      <span class="meta">Palabra ${d.index + 1} de ${words.length}</span>
      <div class="progress">${words.map((x, k) => `<span class="${k < d.index ? "done" : k === d.index ? "current" : ""}"></span>`).join("")}</div>
    </div>
    <ol class="steps" aria-label="Pasos">
      ${STEPS.map((s, k) => `<li class="${k < stepIdx ? "done" : k === stepIdx ? "current" : ""}">${s.label}</li>`).join("")}
    </ol>
    <article class="card step-card" id="step-card">
      ${wordHeader(w)}
      ${techBadge(step.tech)}
      <div id="step-body"></div>
    </article>`;
  bindSpeak();
  STEP_RENDER[step.id](w, document.getElementById("step-body"));
}

function goStep(id) {
  state.daily.step = id;
  save();
  renderToday();
}

const STEP_RENDER = {
  predict(w, $b) {
    const d = state.daily;
    const rand = seededRandom(hashStr(w.id));
    const others = shuffle(WORDS.filter(x => x.lang === w.lang && x.id !== w.id), rand).slice(0, 2);
    const options = shuffle([w, ...others], rand);
    const guess = d.guesses[w.id];

    $b.innerHTML = `
      <p class="label">Léela en contexto</p>
      <p class="example">${highlight(w.example, w)}</p>
      <p class="label">¿Qué crees que significa?</p>
      <div class="options">${options.map(o => {
        const cls = guess ? (o.id === w.id ? "correct" : o.id === guess ? "wrong" : "") : "";
        return `<button class="option ${cls}" data-id="${o.id}" ${guess ? "disabled" : ""}>${esc(o.def)}</button>`;
      }).join("")}</div>
      ${guess ? `
        <p class="feedback ${guess === w.id ? "ok" : "bad"}">${guess === w.id
          ? "¡Bien visto! Lo has deducido del contexto."
          : "No era esa, pero no pasa nada: el intento ya ha preparado a tu cerebro para recordarla."}</p>
        <div class="nav-row"><span></span><button class="btn primary" id="go">Descubrir la palabra →</button></div>` : ""}`;

    $b.querySelectorAll(".option").forEach(btn => (btn.onclick = () => {
      d.guesses[w.id] = btn.dataset.id;
      save();
      addXp(btn.dataset.id === w.id ? 10 : 3, btn.dataset.id === w.id ? "acierto" : "intento");
      renderToday();
    }));
    const go = $b.querySelector("#go");
    if (go) go.onclick = () => goStep("discover");
  },

  discover(w, $b) {
    $b.innerHTML = `${revealHtml(w)}
      <div class="nav-row">
        <button class="btn" id="back">← Volver</button>
        <button class="btn primary" id="go">Crear un gancho →</button>
      </div>`;
    $b.querySelector("#back").onclick = () => goStep("predict");
    $b.querySelector("#go").onclick = () => goStep("hook");
  },

  hook(w, $b) {
    const saved = state.hooks[w.id] || "";
    $b.innerHTML = `
      <p>Inventa algo que te haga pensar en <b>${esc(w.word)}</b> (${esc(w.gloss)}). Cuanto más raro o personal, mejor se recuerda.</p>
      <ul class="ideas">
        <li><b>Sonido:</b> ¿a qué palabra que ya conoces se parece?</li>
        <li><b>Imagen:</b> imagina una escena exagerada o absurda con su significado.</li>
        <li><b>Persona:</b> ¿quién de tu entorno es o hace esto?</li>
      </ul>
      <p class="tip">💡 Pista: ${esc(w.tip)}</p>
      <label class="label" for="hook-text">Tu gancho</label>
      <textarea id="hook-text" placeholder="Ej.: «${esc(exampleHook(w))}»">${esc(saved)}</textarea>
      <div class="nav-row">
        <button class="btn" id="back">← Volver</button>
        <div class="row">
          <button class="link" id="skip">Saltar</button>
          <button class="btn primary" id="go">Guardar gancho →</button>
        </div>
      </div>`;
    $b.querySelector("#back").onclick = () => goStep("discover");
    $b.querySelector("#skip").onclick = () => goStep("use");
    $b.querySelector("#go").onclick = () => {
      const text = $b.querySelector("#hook-text").value.trim();
      if (!text) { $b.querySelector("#hook-text").focus(); return; }
      if (!saved) addXp(15, "gancho");
      state.hooks[w.id] = text;
      save();
      goStep("use");
    };
  },

  use(w, $b) {
    const saved = state.writings[w.id] || "";
    const prompt = w.lang === "es"
      ? `Escribe una frase tuya con «${esc(w.word)}» sobre algo de tu vida: clase, trabajo, amigos, una serie…`
      : `Write your own sentence with “${esc(w.word)}” about your life: studies, work, friends, a series…`;
    $b.innerHTML = `
      <p>${prompt}</p>
      <p class="meta">Modelo: <i>${esc(w.upgrade[1])}</i></p>
      <label class="label" for="writing">Tu frase</label>
      <textarea id="writing" placeholder="${w.lang === "es" ? "Tu frase…" : "Your sentence…"}">${esc(saved)}</textarea>
      <p id="fb" class="feedback"></p>
      <div class="nav-row">
        <button class="btn" id="back">← Volver</button>
        <div class="row">
          <button class="link" id="skip">Saltar</button>
          <button class="btn primary" id="go">Comprobar →</button>
        </div>
      </div>`;
    $b.querySelector("#back").onclick = () => goStep("hook");
    $b.querySelector("#skip").onclick = () => goStep("rate");
    $b.querySelector("#go").onclick = () => {
      const text = $b.querySelector("#writing").value.trim();
      const fb = $b.querySelector("#fb");
      const stem = norm(w.word).slice(0, Math.max(4, w.word.length - 2));
      if (!text) {
        fb.className = "feedback bad"; fb.textContent = "Escribe algo primero 🙂";
      } else if (!norm(text).includes(stem)) {
        fb.className = "feedback bad"; fb.textContent = `No veo «${w.word}» en tu frase. Puedes conjugarla o cambiarle el género.`;
      } else if (text.split(/\s+/).length < 4) {
        fb.className = "feedback bad"; fb.textContent = "Alárgala un poco: al menos 4 palabras.";
      } else {
        if (!saved) addXp(15, "frase");
        state.writings[w.id] = text;
        save();
        goStep("rate");
      }
    };
  },

  rate(w, $b) {
    $b.innerHTML = `
      <p>Con sinceridad: <b>¿cómo de bien crees que la recordarás?</b> Esto decide cuándo vuelve a salir.</p>
      <div class="rate-grid">
        <button class="rate hard" data-r="hard"><span>😕</span><b>Me cuesta</b><small>Hoy mismo en el repaso</small></button>
        <button class="rate good" data-r="good"><span>🙂</span><b>Bien</b><small>Mañana</small></button>
        <button class="rate easy" data-r="easy"><span>😎</span><b>Fácil</b><small>En ${INTERVALS[2]} días</small></button>
      </div>
      <div class="nav-row"><button class="btn" id="back">← Volver</button></div>`;
    $b.querySelector("#back").onclick = () => goStep("use");
    $b.querySelectorAll("[data-r]").forEach(btn => (btn.onclick = () => {
      addWord(w.id, btn.dataset.r);
      addXp(5);
      state.daily.index++;
      state.daily.step = "predict";
      save();
      renderToday();
      window.scrollTo({ top: 0 });
    }));
  },
};

function exampleHook(w) {
  return w.lang === "es"
    ? `Imagino a mi profe intentando ${w.type === "verbo" ? w.word : "ser " + w.word} mientras se le cae el café`
    : `"${w.word}" suena a… y me imagino…`;
}

function revealHtml(w) {
  const other = w.lang === "es" ? "En inglés" : "En español";
  const link = dictLink(w);
  return `
    <div class="reveal">
      <div><p class="label">Significado</p><p class="def">${esc(w.def)}</p></div>
      <div><p class="label">${other}</p><p>${esc(w.gloss)}</p></div>
      <div><p class="label">Ejemplo</p><p class="example">${highlight(w.example, w)}</p></div>
      <div><p class="label">Sube de nivel</p>
        <div class="upgrade">
          <span class="before">${esc(w.upgrade[0])}</span>
          <span class="after">${esc(w.upgrade[1])}</span>
        </div>
      </div>
      <div><p class="label">Palabras cercanas</p><div class="chips">${w.synonyms.map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>
      <p class="tip">💡 ${esc(w.tip)}</p>
      <a class="dict" href="${link.url}" target="_blank" rel="noopener">📖 ${link.label} ↗</a>
    </div>`;
}

function renderDayDone(words) {
  const due = WORDS.filter(w => isDue(w.id)).length;
  $app.innerHTML = `
    <div class="card done-card">
      <p class="big" aria-hidden="true">🎉</p>
      <h2>¡Hecho por hoy!</h2>
      <p>Has trabajado ${words.length} palabras con los 5 pasos. Mañana tendrás otras ${words.length}.</p>
      <div class="lex-list">${words.map(w => `
        <div class="lex-item">
          <div class="top"><b>${esc(w.word)}</b><span class="tag ${w.lang}">${w.lang}</span></div>
          ${state.hooks[w.id] ? `<p>⚓ ${esc(state.hooks[w.id])}</p>` : `<p>${esc(w.gloss)}</p>`}
        </div>`).join("")}</div>
      <p class="tech"><span aria-hidden="true">🧠</span> Lo más eficaz ahora es intentar recordarlas sin mirar. ${due ? `Tienes <b>${due}</b> para repasar.` : ""}</p>
      <div class="row center">
        <button class="btn primary" id="quick">Repaso relámpago de hoy</button>
        <button class="btn" id="again">Volver a verlas</button>
      </div>
    </div>`;
  $app.querySelector("#quick").onclick = () => {
    show("practice");
    startReview(words);
  };
  $app.querySelector("#again").onclick = () => { state.daily.index = 0; state.daily.step = "discover"; save(); renderToday(); };
}

// ───────── Vista: Practicar ─────────
let session = null;
let timer = null;

function stopTimer() { clearInterval(timer); timer = null; }

function practicePool() {
  const learned = WORDS.filter(w => isLearned(w.id));
  return learned.length >= 4 ? learned : [...learned, ...dailyWords().filter(w => !isLearned(w.id))];
}

function renderPractice() {
  if (session) return SESSION_RENDER[session.mode]();
  const learned = WORDS.filter(w => isLearned(w.id)).length;
  const due = WORDS.filter(w => isDue(w.id)).length;
  const bestPairs = state.best.pairs;

  $app.innerHTML = `
    <p class="intro">${learned
      ? `Llevas ${learned} palabra${learned > 1 ? "s" : ""}. ${due ? `<b>${due}</b> toca${due > 1 ? "n" : ""} repasar hoy.` : "Ninguna pendiente hoy: puedes jugar libremente."}`
      : "Aún no has aprendido ninguna: practicarás con las de hoy."}</p>
    <div class="modes">
      <button class="mode" id="m-review">
        <span class="mode-icon" aria-hidden="true">📅</span>
        <span><b>Repaso inteligente</b>
        <small>Repetición espaciada + recuerdo activo. Escribes palabras, completas frases y valoras cada acierto. Las falladas vuelven en la misma sesión.</small></span>
        ${due ? `<span class="badge">${due}</span>` : ""}
      </button>
      <button class="mode" id="m-sprint">
        <span class="mode-icon" aria-hidden="true">⚡</span>
        <span><b>Contrarreloj</b>
        <small>${SPRINT_SECONDS} segundos, preguntas mezcladas y combos que multiplican los puntos.${state.best.sprint ? ` Tu récord: ${state.best.sprint}.` : ""}</small></span>
      </button>
      <button class="mode" id="m-pairs">
        <span class="mode-icon" aria-hidden="true">🔗</span>
        <span><b>Parejas</b>
        <small>Une cada palabra con su traducción lo más rápido que puedas.${bestPairs ? ` Tu récord: ${bestPairs.toFixed(1)} s.` : ""}</small></span>
      </button>
    </div>
    ${techBadge("interleaving")}`;
  $app.querySelector("#m-review").onclick = () => startReview();
  $app.querySelector("#m-sprint").onclick = () => startSprint();
  $app.querySelector("#m-pairs").onclick = () => startPairs();
}

function exitSession() {
  stopTimer();
  session = null;
  renderPractice();
}

// Pregunta de opción múltiple o de escribir.
function buildQuestion(w, kinds) {
  const kind = pick(kinds);
  const distractors = shuffle(WORDS.filter(x => x.lang === w.lang && x.id !== w.id)).slice(0, 3);
  const asWords = shuffle([w, ...distractors]).map(x => ({ id: x.id, text: x.word }));
  switch (kind) {
    case "type":
      return { kind, word: w, label: "Escríbela", prompt: esc(w.def), hint: w.gloss };
    case "type-cloze":
      return { kind: "type", word: w, label: "Escribe la que falta",
        prompt: esc(w.cloze).replace("___", '<span class="blank">&nbsp;</span>'), hint: w.gloss };
    case "gloss":
      return { kind, word: w, label: w.lang === "es" ? "¿Qué significa?" : "¿Qué significa en español?",
        prompt: `<b class="serif">${esc(w.word)}</b>`,
        options: shuffle([w, ...distractors]).map(x => ({ id: x.id, text: x.gloss })) };
    case "cloze":
      return { kind, word: w, label: "Completa la frase",
        prompt: esc(w.cloze).replace("___", '<span class="blank">&nbsp;</span>'), options: asWords };
    case "upgrade":
      return { kind, word: w, label: "Sube de nivel: ¿qué palabra usarías?", prompt: `«${esc(w.upgrade[0])}»`, options: asWords };
    default:
      return { kind: "def", word: w, label: "¿Qué palabra es?", prompt: esc(w.def), options: asWords };
  }
}

// ── Repaso inteligente ──
function startReview(only) {
  stopTimer();
  let words;
  if (only) {
    words = shuffle(only);
  } else {
    const pool = practicePool();
    const due = shuffle(pool.filter(w => isDue(w.id)));
    const rest = pool.filter(w => !isDue(w.id))
      .sort((a, b) => ((state.progress[a.id]?.box ?? 0) - (state.progress[b.id]?.box ?? 0)) || (Math.random() - 0.5));
    words = [...due, ...rest].slice(0, SESSION_LENGTH);
    words = shuffle(words); // intercalar idiomas
  }
  session = { mode: "review", queue: words, total: words.length, i: 0, right: 0, wrong: 0, retries: {}, q: null, missed: new Set() };
  nextReviewQuestion();
}

function nextReviewQuestion() {
  const w = session.queue[session.i];
  if (!w) { session.q = null; return renderPractice(); }
  // Las nuevas o flojas: más reconocimiento; las asentadas: más recuerdo escrito.
  const box = state.progress[w.id]?.box ?? 0;
  const kinds = box >= 2
    ? ["type", "type", "type-cloze", "cloze", "upgrade", "gloss"]
    : ["def", "cloze", "upgrade", "gloss", "type"];
  session.q = buildQuestion(w, kinds);
  session.answered = null;
  session.hints = 0;
  renderPractice();
}

const SESSION_RENDER = {
  review() {
    const s = session;
    if (!s.q) {
      const missed = [...s.missed].map(id => byId[id]);
      $app.innerHTML = `
        <div class="card done-card">
          <p class="score">${s.right}<small>/${s.right + s.wrong}</small></p>
          <p>${s.wrong === 0 ? "¡Sesión perfecta! 🎯" : "Las falladas han vuelto a salir hasta que las acertaste. Así funciona la repetición espaciada."}</p>
          ${missed.length ? `<p class="meta">Te costaron: ${missed.map(w => `<b>${esc(w.word)}</b>`).join(", ")}. Volverán pronto.</p>` : ""}
          <div class="row center">
            <button class="btn primary" id="again">Otra sesión</button>
            <button class="btn" id="exit">Salir</button>
          </div>
        </div>`;
      $app.querySelector("#again").onclick = () => startReview();
      $app.querySelector("#exit").onclick = exitSession;
      return;
    }
    const q = s.q;
    const w = q.word;
    $app.innerHTML = `
      <div class="session-head">
        <button class="link" id="exit">✕ Salir</button>
        <span class="meta">${s.i + 1} / ${s.queue.length}</span>
      </div>
      <div class="progress">${s.queue.map((_, k) => `<span class="${k < s.i ? "done" : k === s.i ? "current" : ""}"></span>`).join("")}</div>
      <div class="card">
        <div class="tags">
          <span class="tag ${w.lang}">${w.lang === "es" ? "Español" : "English"}</span>
          <span class="tag">${esc(q.label)}</span>
        </div>
        <p class="question">${q.prompt}</p>
        <div id="answer"></div>
        <div id="after"></div>
      </div>
      ${q.kind === "type" ? techBadge("recall") : ""}`;
    $app.querySelector("#exit").onclick = exitSession;

    const $ans = $app.querySelector("#answer");
    if (q.kind === "type") {
      $ans.innerHTML = `
        <div class="type-row">
          <input id="typed" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe la palabra…" aria-label="Tu respuesta">
          <button class="btn primary" id="check">Comprobar</button>
        </div>
        <div class="row hint-row">
          <button class="link" id="hint">💡 Pista</button>
          <span id="hint-text" class="meta"></span>
        </div>`;
      const $in = $ans.querySelector("#typed");
      $in.focus();
      $in.onkeydown = e => { if (e.key === "Enter") answerTyped(); };
      $ans.querySelector("#check").onclick = answerTyped;
      $ans.querySelector("#hint").onclick = () => {
        s.hints++;
        const hint = s.hints === 1
          ? `Traducción: ${q.hint}`
          : `Empieza por «${w.word.slice(0, s.hints - 1)}…» (${w.word.length} letras)`;
        $ans.querySelector("#hint-text").textContent = hint;
        $in.focus();
      };
    } else {
      $ans.innerHTML = `<div class="options">${q.options.map(o =>
        `<button class="option" data-id="${o.id}">${esc(o.text)}</button>`).join("")}</div>`;
      $ans.querySelectorAll(".option").forEach(btn => (btn.onclick = () => {
        if (s.answered) return;
        const ok = btn.dataset.id === w.id;
        $ans.querySelectorAll(".option").forEach(b => {
          b.disabled = true;
          if (b.dataset.id === w.id) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });
        afterAnswer(ok);
      }));
    }
  },
  sprint: renderSprint,
  pairs: renderPairs,
};

function answerTyped() {
  const s = session;
  if (s.answered) return;
  const $in = $app.querySelector("#typed");
  const typed = norm($in.value);
  if (!typed) { $in.focus(); return; }
  const target = norm(s.q.word.word);
  const exact = typed === target;
  const close = !exact && target.length > 5 && distance(typed, target) === 1;
  $in.disabled = true;
  $in.classList.add(exact || close ? "correct" : "wrong");
  $app.querySelector("#check").disabled = true;
  $app.querySelector("#hint").disabled = true;
  afterAnswer(exact || close, close ? `Casi perfecto: se escribe <b>${esc(s.q.word.word)}</b>.` : "");
}

function afterAnswer(ok, note = "") {
  const s = session;
  const w = s.q.word;
  s.answered = ok ? "right" : "wrong";
  const $after = $app.querySelector("#after");
  const link = dictLink(w);
  if (ok) {
    s.right++;
    addXp(s.q.kind === "type" ? Math.max(5, 20 - s.hints * 5) : 10);
    const usedHints = s.hints > 0;
    $after.innerHTML = `
      <p class="feedback ok">¡Correcto! ${note}</p>
      <p class="label">¿Cómo te ha costado?</p>
      <div class="rate-grid compact">
        <button class="rate hard" data-r="hard"><b>Difícil</b></button>
        <button class="rate good" data-r="good"><b>Bien</b></button>
        ${usedHints ? "" : `<button class="rate easy" data-r="easy"><b>Fácil</b></button>`}
      </div>`;
    $after.querySelectorAll("[data-r]").forEach(b => (b.onclick = () => {
      if (isLearned(w.id)) review(w.id, b.dataset.r);
      else addWord(w.id, b.dataset.r);
      s.i++;
      nextReviewQuestion();
    }));
  } else {
    s.wrong++;
    s.missed.add(w.id);
    // Vuelve a salir al final de la sesión (máximo 2 veces).
    s.retries[w.id] = (s.retries[w.id] || 0) + 1;
    if (s.retries[w.id] <= 2) s.queue.push(w);
    $after.innerHTML = `
      <div class="reveal">
        <p class="feedback bad">Era <b>${esc(w.word)}</b>: ${esc(w.def)}</p>
        <p class="example">${highlight(w.example, w)}</p>
        ${state.hooks[w.id] ? `<p class="tip">⚓ Tu gancho: ${esc(state.hooks[w.id])}</p>` : `<p class="tip">💡 ${esc(w.tip)}</p>`}
        <a class="dict" href="${link.url}" target="_blank" rel="noopener">📖 ${link.label} ↗</a>
      </div>
      <div class="nav-row"><span class="meta">Volverá a salir en esta sesión.</span><button class="btn primary" id="next">Siguiente →</button></div>`;
    $after.querySelector("#next").onclick = () => {
      if (isLearned(w.id)) review(w.id, "again");
      else addWord(w.id, "hard");
      s.i++;
      nextReviewQuestion();
    };
    $after.querySelector("#next").focus();
  }
}

// ── Contrarreloj ──
function startSprint() {
  stopTimer();
  session = { mode: "sprint", pool: practicePool(), score: 0, combo: 0, maxCombo: 0, right: 0, wrong: 0,
    ends: Date.now() + SPRINT_SECONDS * 1000, q: null, over: false, started: false };
  nextSprintQuestion();
}
function nextSprintQuestion() {
  const s = session;
  let w;
  do { w = pick(s.pool); } while (s.pool.length > 1 && s.q && w.id === s.q.word.id);
  s.q = buildQuestion(w, ["def", "gloss", "cloze", "upgrade"]);
  s.locked = false;
  renderSprint();
}
function multiplier(combo) { return combo >= 8 ? 4 : combo >= 5 ? 3 : combo >= 2 ? 2 : 1; }

function renderSprint() {
  const s = session;
  if (s.over) {
    $app.innerHTML = `
      <div class="card done-card">
        <p class="label">Puntuación</p>
        <p class="score">${s.score}</p>
        ${s.record ? `<p class="feedback ok">🏆 ¡Nuevo récord!</p>` : `<p class="meta">Récord: ${state.best.sprint}</p>`}
        <p>${s.right} aciertos · ${s.wrong} fallos · combo máximo ×${multiplier(s.maxCombo)} (${s.maxCombo} seguidas)</p>
        <div class="row center">
          <button class="btn primary" id="again">Otra vez</button>
          <button class="btn" id="exit">Salir</button>
        </div>
      </div>`;
    $app.querySelector("#again").onclick = startSprint;
    $app.querySelector("#exit").onclick = exitSession;
    return;
  }
  const q = s.q;
  const mult = multiplier(s.combo);
  $app.innerHTML = `
    <div class="session-head">
      <button class="link" id="exit">✕ Salir</button>
      <span class="sprint-score"><b id="sp-score">${s.score}</b> pts</span>
      <span class="combo ${mult > 1 ? "on" : ""}" id="combo">×${mult}</span>
    </div>
    <div class="timebar"><span id="timebar"></span></div>
    <div class="card">
      <div class="tags"><span class="tag ${q.word.lang}">${q.word.lang === "es" ? "Español" : "English"}</span><span class="tag">${esc(q.label)}</span></div>
      <p class="question">${q.prompt}</p>
      <div class="options">${q.options.map(o => `<button class="option" data-id="${o.id}">${esc(o.text)}</button>`).join("")}</div>
    </div>`;
  $app.querySelector("#exit").onclick = exitSession;
  tickSprint();
  if (!timer) timer = setInterval(tickSprint, 100);

  $app.querySelectorAll(".option").forEach(btn => (btn.onclick = () => {
    if (s.locked || s.over) return;
    s.locked = true;
    const ok = btn.dataset.id === q.word.id;
    if (ok) {
      s.combo++;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      s.right++;
      s.score += 10 * multiplier(s.combo);
    } else {
      s.combo = 0;
      s.wrong++;
    }
    $app.querySelectorAll(".option").forEach(b => {
      b.disabled = true;
      if (b.dataset.id === q.word.id) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
    });
    setTimeout(() => { if (session === s && !s.over) nextSprintQuestion(); }, ok ? 350 : 900);
  }));
}
function tickSprint() {
  const s = session;
  if (!s || s.mode !== "sprint") return stopTimer();
  const left = Math.max(0, s.ends - Date.now());
  const bar = document.getElementById("timebar");
  if (bar) {
    bar.style.width = `${(left / (SPRINT_SECONDS * 1000)) * 100}%`;
    bar.classList.toggle("low", left < 10000);
  }
  if (left <= 0 && !s.over) {
    stopTimer();
    s.over = true;
    s.record = s.score > state.best.sprint;
    state.best.sprint = Math.max(state.best.sprint, s.score);
    save();
    addXp(Math.round(s.score / 5), "contrarreloj");
    renderSprint();
  }
}

// ── Parejas ──
function startPairs() {
  stopTimer();
  const pool = shuffle(practicePool()).slice(0, PAIRS);
  session = {
    mode: "pairs", words: pool, left: shuffle(pool), right: shuffle(pool),
    matched: new Set(), sel: null, mistakes: 0, start: Date.now(), end: null,
  };
  renderPairs();
  timer = setInterval(() => {
    const t = document.getElementById("pairs-time");
    if (t && session && session.mode === "pairs" && !session.end) t.textContent = ((Date.now() - session.start) / 1000).toFixed(1);
  }, 100);
}
function renderPairs() {
  const s = session;
  if (s.end) {
    const secs = (s.end - s.start) / 1000;
    $app.innerHTML = `
      <div class="card done-card">
        <p class="label">Tiempo</p>
        <p class="score">${secs.toFixed(1)}<small> s</small></p>
        ${s.record ? `<p class="feedback ok">🏆 ¡Nuevo récord!</p>` : `<p class="meta">Récord: ${state.best.pairs.toFixed(1)} s</p>`}
        <p>${s.mistakes === 0 ? "Sin un solo fallo 👌" : `${s.mistakes} fallo${s.mistakes > 1 ? "s" : ""}`}</p>
        <div class="row center">
          <button class="btn primary" id="again">Otra vez</button>
          <button class="btn" id="exit">Salir</button>
        </div>
      </div>`;
    $app.querySelector("#again").onclick = startPairs;
    $app.querySelector("#exit").onclick = exitSession;
    return;
  }
  $app.innerHTML = `
    <div class="session-head">
      <button class="link" id="exit">✕ Salir</button>
      <span class="meta">⏱ <b id="pairs-time">0.0</b> s · ${s.matched.size}/${s.words.length}</span>
    </div>
    <p class="intro">Toca una palabra y luego su traducción.</p>
    <div class="pairs">
      <div class="col">${s.left.map(w => `<button class="pair ${s.matched.has(w.id) ? "matched" : ""} ${s.sel === w.id ? "selected" : ""}" data-side="l" data-id="${w.id}" ${s.matched.has(w.id) ? "disabled" : ""}><span class="tag ${w.lang}">${w.lang}</span> ${esc(w.word)}</button>`).join("")}</div>
      <div class="col">${s.right.map(w => `<button class="pair ${s.matched.has(w.id) ? "matched" : ""}" data-side="r" data-id="${w.id}" ${s.matched.has(w.id) ? "disabled" : ""}>${esc(w.gloss)}</button>`).join("")}</div>
    </div>`;
  $app.querySelector("#exit").onclick = exitSession;
  $app.querySelectorAll(".pair").forEach(btn => (btn.onclick = () => {
    if (btn.dataset.side === "l") { s.sel = btn.dataset.id; renderPairs(); return; }
    if (!s.sel) { btn.classList.add("shake"); setTimeout(() => btn.classList.remove("shake"), 400); return; }
    if (btn.dataset.id === s.sel) {
      s.matched.add(s.sel);
      s.sel = null;
      if (s.matched.size === s.words.length) {
        s.end = Date.now();
        stopTimer();
        const secs = (s.end - s.start) / 1000;
        s.record = !state.best.pairs || secs < state.best.pairs;
        if (s.record) state.best.pairs = secs;
        save();
        addXp(PAIRS * 5 - s.mistakes * 2, "parejas");
      }
      renderPairs();
    } else {
      s.mistakes++;
      btn.classList.add("shake", "wrong");
      setTimeout(() => btn.classList.remove("shake", "wrong"), 450);
    }
  }));
}

// ───────── Vista: Mi léxico ─────────
let lexFilter = { q: "", lang: "all" };

function renderLexicon() {
  const learned = WORDS.filter(w => isLearned(w.id));
  if (!learned.length) {
    $app.innerHTML = `<div class="card empty"><p>Aún no tienes palabras. Empieza en <b>Hoy</b>.</p></div>`;
    return;
  }
  const mastered = learned.filter(w => state.progress[w.id].box >= 4).length;
  $app.innerHTML = `
    <div class="lex-summary">
      <div><b>${learned.length}</b><span>aprendidas</span></div>
      <div><b>${mastered}</b><span>dominadas</span></div>
      <div><b>${WORDS.filter(w => isDue(w.id)).length}</b><span>para repasar</span></div>
    </div>
    <div class="filters">
      <input id="lex-q" type="search" placeholder="Buscar…" value="${esc(lexFilter.q)}" aria-label="Buscar">
      <select id="lex-lang" aria-label="Filtrar">
        <option value="all">Todas</option>
        <option value="es" ${lexFilter.lang === "es" ? "selected" : ""}>Español</option>
        <option value="en" ${lexFilter.lang === "en" ? "selected" : ""}>English</option>
        <option value="due" ${lexFilter.lang === "due" ? "selected" : ""}>Para repasar</option>
      </select>
    </div>
    <div class="lex-list" id="lex-list"></div>`;

  const draw = () => {
    const q = norm(lexFilter.q);
    const items = learned.filter(w =>
      (lexFilter.lang === "all" || w.lang === lexFilter.lang || (lexFilter.lang === "due" && isDue(w.id))) &&
      (!q || norm(w.word + " " + w.def + " " + w.gloss).includes(q)));
    $app.querySelector("#lex-list").innerHTML = items.length ? items.map(w => {
      const p = state.progress[w.id];
      const link = dictLink(w);
      return `
        <details class="lex-item">
          <summary>
            <span class="top">
              <span><b>${esc(w.word)}</b> <span class="tag ${w.lang}">${w.lang}</span>${isDue(w.id) ? ` <span class="tag due">repasar</span>` : ""}</span>
              <span class="level" title="Nivel ${p.box} de ${MAX_BOX}">${Array.from({ length: MAX_BOX }, (_, k) => `<i class="${k < p.box ? "on" : ""}"></i>`).join("")}</span>
            </span>
            <span class="gloss">${esc(w.gloss)}</span>
          </summary>
          <div class="lex-body">
            <p>${esc(w.def)}</p>
            <p class="example">${highlight(w.example, w)}</p>
            ${state.hooks[w.id] ? `<p>⚓ ${esc(state.hooks[w.id])}</p>` : ""}
            ${state.writings[w.id] ? `<p>✍️ <i>${esc(state.writings[w.id])}</i></p>` : ""}
            <p class="meta">${p.right} aciertos · ${p.wrong} fallos · ${p.due <= today() ? "toca hoy" : `próximo repaso en ${p.due - today()} día${p.due - today() > 1 ? "s" : ""}`}</p>
            <a class="dict" href="${link.url}" target="_blank" rel="noopener">📖 ${link.label} ↗</a>
          </div>
        </details>`;
    }).join("") : `<p class="empty">Nada coincide con la búsqueda.</p>`;
  };
  $app.querySelector("#lex-q").oninput = e => { lexFilter.q = e.target.value; draw(); };
  $app.querySelector("#lex-lang").onchange = e => { lexFilter.lang = e.target.value; draw(); };
  draw();
}

// ───────── Vista: Método ─────────
function renderMethod() {
  $app.innerHTML = `
    <p class="intro">Esta app no te hace memorizar listas. Cada parte usa una técnica de aprendizaje estudiada por la psicología cognitiva.</p>
    <div class="tech-list">${Object.values(TECHNIQUES).map(t => `
      <div class="card tech-card">
        <h3><span aria-hidden="true">${t.icon}</span> ${t.name}</h3>
        <p>${t.long}</p>
        <p class="meta">Dónde: ${t.where}</p>
      </div>`).join("")}</div>
    <div class="card">
      <h3>Los significados</h3>
      <p>Las definiciones de la app están redactadas para aprender rápido. Para ver la definición oficial completa, cada palabra tiene un enlace a su entrada en el <b>Diccionario de la lengua española de la RAE</b> (dle.rae.es) y, en inglés, al <b>Cambridge Dictionary</b>.</p>
    </div>`;
}

// ───────── Navegación ─────────
const views = { today: renderToday, practice: renderPractice, lexicon: renderLexicon, method: renderMethod };

function show(view) {
  if (view !== "practice") { stopTimer(); session = null; }
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
  document.getElementById("level").textContent = level();
  document.getElementById("xpbar").style.width = `${state.xp % XP_PER_LEVEL}%`;
  document.getElementById("level-stat").title = `${state.xp} XP · ${XP_PER_LEVEL - (state.xp % XP_PER_LEVEL)} para el nivel ${level() + 1}`;
}

document.querySelectorAll(".tabs button").forEach(b => (b.onclick = () => show(b.dataset.view)));

// Confirmación en dos clics (algunos visores bloquean confirm()).
const $reset = document.getElementById("reset");
let resetArmed = false;
$reset.onclick = () => {
  if (!resetArmed) {
    resetArmed = true;
    $reset.textContent = "¿Seguro? Pulsa otra vez para borrar todo";
    setTimeout(() => { resetArmed = false; $reset.textContent = "Reiniciar progreso"; }, 4000);
    return;
  }
  resetArmed = false;
  $reset.textContent = "Reiniciar progreso";
  state = freshState();
  session = null;
  stopTimer();
  save();
  updateStats();
  show("today");
};

updateStats();
show("today");
