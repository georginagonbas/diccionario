// Banco de palabras.
// Campos:
//   id        identificador único
//   lang      "es" | "en"
//   word      la palabra
//   type      categoría gramatical
//   register  "cotidiano" | "académico" | "profesional" | "literario"
//   def       definición en el idioma de la palabra
//   gloss     equivalente en el otro idioma
//   example   frase de ejemplo
//   synonyms  palabras cercanas (con matices)
//   upgrade   [frase "plana", frase mejorada] para ver cómo sube el nivel
//   cloze     frase con ___ donde encaja la palabra
//   tip       curiosidad, etimología o matiz de uso

const WORDS = [
  // ───────────── ESPAÑOL ─────────────
  {
    id: "es-matizar", lang: "es", word: "matizar", type: "verbo", register: "académico",
    def: "Introducir una precisión o diferencia en una afirmación para que sea más exacta.",
    gloss: "to qualify, to nuance",
    example: "Conviene matizar esta conclusión antes de presentar los resultados.",
    synonyms: ["precisar", "puntualizar", "aclarar"],
    upgrade: ["Quiero decir una cosa sobre lo que has dicho.", "Me gustaría matizar lo que has dicho."],
    cloze: "No digo que esté mal; solo quiero ___ un par de detalles.",
    tip: "Viene de «matiz», cada uno de los grados de un mismo color. Matizar es añadir tonos a una idea."
  },
  {
    id: "es-soslayar", lang: "es", word: "soslayar", type: "verbo", register: "literario",
    def: "Esquivar una dificultad o un asunto, pasarlo por alto de forma intencionada.",
    gloss: "to sidestep, to avoid",
    example: "El informe soslaya el problema principal: la falta de presupuesto.",
    synonyms: ["eludir", "esquivar", "obviar"],
    upgrade: ["No habló del tema difícil.", "Soslayó el tema más delicado."],
    cloze: "En la entrevista intentó ___ las preguntas incómodas.",
    tip: "Procede de «de soslayo»: de lado, oblicuamente. Mirar algo de soslayo es mirarlo sin enfrentarlo."
  },
  {
    id: "es-idoneo", lang: "es", word: "idóneo", type: "adjetivo", register: "profesional",
    def: "Adecuado y apropiado para algo; que reúne las condiciones necesarias.",
    gloss: "suitable, ideal",
    example: "Buscamos el candidato idóneo para el puesto.",
    synonyms: ["adecuado", "apropiado", "pertinente"],
    upgrade: ["Es el sitio bueno para hacerlo.", "Es el lugar idóneo para hacerlo."],
    cloze: "Primavera es el momento ___ para visitar la ciudad.",
    tip: "Del latín «idoneus». Es más preciso que «bueno»: indica que encaja exactamente con un propósito."
  },
  {
    id: "es-ineludible", lang: "es", word: "ineludible", type: "adjetivo", register: "académico",
    def: "Que no se puede evitar.",
    gloss: "unavoidable",
    example: "Revisar las fuentes es un paso ineludible en cualquier investigación.",
    synonyms: ["inevitable", "obligado", "insoslayable"],
    upgrade: ["Hay que hacerlo sí o sí.", "Es un paso ineludible."],
    cloze: "La reunión del lunes es ___: hay que decidir el presupuesto.",
    tip: "Es lo contrario de «eludir» (evitar). Su primo culto es «insoslayable»."
  },
  {
    id: "es-paliar", lang: "es", word: "paliar", type: "verbo", register: "académico",
    def: "Atenuar o suavizar un daño, un dolor o un problema, sin eliminarlo del todo.",
    gloss: "to alleviate, to mitigate",
    example: "Las ayudas buscan paliar los efectos de la crisis.",
    synonyms: ["mitigar", "aliviar", "atenuar"],
    upgrade: ["Las medidas ayudan a que el problema sea menos malo.", "Las medidas palian el problema."],
    cloze: "Pusieron toldos para ___ el calor en el patio.",
    tip: "Del latín «pallium», manto: cubrir algo para que duela menos. De ahí «cuidados paliativos»."
  },
  {
    id: "es-exhaustivo", lang: "es", word: "exhaustivo", type: "adjetivo", register: "académico",
    def: "Que trata algo de forma completa, sin dejar nada fuera.",
    gloss: "thorough, exhaustive",
    example: "Hicieron un análisis exhaustivo de los datos.",
    synonyms: ["minucioso", "completo", "pormenorizado"],
    upgrade: ["Lo miramos todo muy a fondo.", "Hicimos una revisión exhaustiva."],
    cloze: "Antes de firmar, haz una lectura ___ del contrato.",
    tip: "Ojo: se escribe con «h» después de la «x» (ex-haurire, «sacar hasta el final»)."
  },
  {
    id: "es-escueto", lang: "es", word: "escueto", type: "adjetivo", register: "cotidiano",
    def: "Breve, sin adornos ni palabras de más.",
    gloss: "brief, terse",
    example: "Su respuesta fue escueta: «No».",
    synonyms: ["conciso", "sucinto", "lacónico"],
    upgrade: ["Me contestó muy corto.", "Me dio una respuesta escueta."],
    cloze: "El comunicado fue tan ___ que nadie entendió qué había pasado.",
    tip: "Puede sonar algo seco. «Conciso» es más elogioso: breve pero completo."
  },
  {
    id: "es-ecuanime", lang: "es", word: "ecuánime", type: "adjetivo", register: "profesional",
    def: "Que actúa con imparcialidad y serenidad, sin dejarse llevar por las emociones.",
    gloss: "even-handed, level-headed",
    example: "Necesitamos un árbitro ecuánime.",
    synonyms: ["imparcial", "justo", "sereno"],
    upgrade: ["Es una persona que no se pone de parte de nadie y no se altera.", "Es una persona ecuánime."],
    cloze: "Incluso en plena discusión, se mantuvo ___ y escuchó a ambas partes.",
    tip: "Del latín «aequus» (igual) + «animus» (ánimo): tener el ánimo igualado."
  },
  {
    id: "es-perspicaz", lang: "es", word: "perspicaz", type: "adjetivo", register: "cotidiano",
    def: "Que capta con rapidez cosas que a otros se les escapan.",
    gloss: "perceptive, shrewd",
    example: "Fue muy perspicaz al notar el error en la tabla.",
    synonyms: ["sagaz", "agudo", "avispado"],
    upgrade: ["Se da cuenta de todo enseguida.", "Es muy perspicaz."],
    cloze: "Una lectora ___ habría descubierto al culpable en el capítulo dos.",
    tip: "Literalmente, «que ve a través» (per-spicere). Se usa para la mente, no para la vista."
  },
  {
    id: "es-acuciante", lang: "es", word: "acuciante", type: "adjetivo", register: "académico",
    def: "Urgente; que exige una solución rápida.",
    gloss: "pressing, urgent",
    example: "La falta de vivienda es un problema acuciante.",
    synonyms: ["apremiante", "urgente", "perentorio"],
    upgrade: ["Es un problema que hay que arreglar ya.", "Es un problema acuciante."],
    cloze: "Tenemos una necesidad ___ de más voluntarios.",
    tip: "Viene de «acuciar», estimular o dar prisa, como quien pincha con algo agudo."
  },
  {
    id: "es-subsanar", lang: "es", word: "subsanar", type: "verbo", register: "profesional",
    def: "Corregir un error o reparar un defecto.",
    gloss: "to rectify, to remedy",
    example: "Hemos subsanado el error de la factura.",
    synonyms: ["corregir", "enmendar", "rectificar"],
    upgrade: ["Ya hemos arreglado el fallo.", "Ya hemos subsanado el fallo."],
    cloze: "Tienes diez días para ___ los defectos de la solicitud.",
    tip: "Muy común en documentos oficiales: «plazo de subsanación»."
  },
  {
    id: "es-vislumbrar", lang: "es", word: "vislumbrar", type: "verbo", register: "literario",
    def: "Ver algo de forma tenue o lejana; también, intuir algo que aún no está claro.",
    gloss: "to glimpse, to make out",
    example: "Empezamos a vislumbrar una solución.",
    synonyms: ["entrever", "atisbar", "intuir"],
    upgrade: ["Ya se empieza a ver un poco el final.", "Ya se vislumbra el final."],
    cloze: "Entre la niebla se podía ___ la silueta del faro.",
    tip: "Une «vista» y «lumbre»: ver gracias a una luz débil."
  },
  {
    id: "es-efimero", lang: "es", word: "efímero", type: "adjetivo", register: "literario",
    def: "Que dura muy poco tiempo.",
    gloss: "ephemeral, fleeting",
    example: "La fama en redes suele ser efímera.",
    synonyms: ["pasajero", "fugaz", "breve"],
    upgrade: ["Ese éxito duró muy poquito.", "Fue un éxito efímero."],
    cloze: "Disfruta del momento: la belleza de las flores de cerezo es ___.",
    tip: "Del griego «ephémeros», «que dura un día». Hay insectos llamados efímeras porque viven horas."
  },
  {
    id: "es-inherente", lang: "es", word: "inherente", type: "adjetivo", register: "académico",
    def: "Que forma parte esencial de algo y no se puede separar de ello.",
    gloss: "inherent",
    example: "El riesgo es inherente a cualquier inversión.",
    synonyms: ["intrínseco", "propio", "consustancial"],
    upgrade: ["Eso siempre viene con el trabajo.", "Eso es inherente al trabajo."],
    cloze: "La incertidumbre es ___ a la ciencia.",
    tip: "Se construye con «a»: inherente a algo."
  },
  {
    id: "es-sopesar", lang: "es", word: "sopesar", type: "verbo", register: "cotidiano",
    def: "Examinar con atención las ventajas e inconvenientes de algo antes de decidir.",
    gloss: "to weigh up",
    example: "Sopesó las dos ofertas durante una semana.",
    synonyms: ["valorar", "ponderar", "calibrar"],
    upgrade: ["Estoy pensando en lo bueno y lo malo.", "Estoy sopesando los pros y los contras."],
    cloze: "Antes de mudarte, ___ bien lo que ganas y lo que pierdes.",
    tip: "Literalmente, levantar algo con la mano para calcular su peso."
  },
  {
    id: "es-recabar", lang: "es", word: "recabar", type: "verbo", register: "profesional",
    def: "Reunir o conseguir información, datos, apoyos, etc., normalmente tras pedirlos.",
    gloss: "to gather, to obtain",
    example: "Estamos recabando datos para el estudio.",
    synonyms: ["reunir", "recopilar", "obtener"],
    upgrade: ["Estamos buscando información.", "Estamos recabando información."],
    cloze: "La periodista intentó ___ testimonios de los vecinos.",
    tip: "No confundir con «recavar» (volver a cavar). Con «b» es el de la información."
  },
  {
    id: "es-menoscabar", lang: "es", word: "menoscabar", type: "verbo", register: "académico",
    def: "Disminuir o dañar el valor, la calidad o el prestigio de algo.",
    gloss: "to undermine, to impair",
    example: "Los rumores menoscabaron su reputación.",
    synonyms: ["mermar", "deteriorar", "perjudicar"],
    upgrade: ["Esto hace que la empresa parezca peor.", "Esto menoscaba la imagen de la empresa."],
    cloze: "Las críticas constantes pueden ___ la confianza de cualquiera.",
    tip: "De «menos» + «cabo» (extremo): dejar algo más corto de lo que era."
  },
  {
    id: "es-fehaciente", lang: "es", word: "fehaciente", type: "adjetivo", register: "profesional",
    def: "Que prueba algo de forma clara e indiscutible.",
    gloss: "reliable, conclusive (proof)",
    example: "No hay pruebas fehacientes de que estuviera allí.",
    synonyms: ["irrefutable", "fidedigno", "indiscutible"],
    upgrade: ["No hay pruebas seguras.", "No hay pruebas fehacientes."],
    cloze: "Necesitamos una prueba ___ de que el pago se realizó.",
    tip: "Viene de «hacer fe»: algo que da fe, que certifica."
  },
  {
    id: "es-elocuente", lang: "es", word: "elocuente", type: "adjetivo", register: "cotidiano",
    def: "Que se expresa con eficacia para convencer o conmover; también, que muestra algo con claridad sin palabras.",
    gloss: "eloquent, telling",
    example: "Su silencio fue muy elocuente.",
    synonyms: ["expresivo", "persuasivo", "significativo"],
    upgrade: ["Su cara lo dijo todo.", "Su gesto fue elocuente."],
    cloze: "Los datos son tan ___ que no hace falta añadir nada.",
    tip: "Se puede aplicar a cosas: una mirada, una cifra o un silencio pueden ser elocuentes."
  },
  {
    id: "es-propiciar", lang: "es", word: "propiciar", type: "verbo", register: "académico",
    def: "Favorecer o crear las condiciones para que algo ocurra.",
    gloss: "to foster, to bring about",
    example: "El buen clima propició el acuerdo.",
    synonyms: ["favorecer", "facilitar", "fomentar"],
    upgrade: ["El ambiente ayudó a que habláramos.", "El ambiente propició la conversación."],
    cloze: "Un espacio abierto puede ___ la colaboración entre equipos.",
    tip: "Suele usarse con cosas positivas y neutras; para lo negativo es más común «provocar»."
  },
  {
    id: "es-incipiente", lang: "es", word: "incipiente", type: "adjetivo", register: "académico",
    def: "Que está empezando.",
    gloss: "incipient, budding",
    example: "Es una empresa incipiente, pero con mucho potencial.",
    synonyms: ["naciente", "inicial", "emergente"],
    upgrade: ["Es un proyecto que acaba de empezar.", "Es un proyecto incipiente."],
    cloze: "Notó una ___ calvicie en la coronilla.",
    tip: "Del latín «incipere», comenzar. Es el mismo origen que «principio»."
  },
  {
    id: "es-pormenorizar", lang: "es", word: "pormenorizar", type: "verbo", register: "profesional",
    def: "Describir o explicar algo con todo detalle.",
    gloss: "to detail, to itemize",
    example: "El presupuesto pormenoriza cada gasto.",
    synonyms: ["detallar", "desglosar", "especificar"],
    upgrade: ["Explícalo con todos los detalles.", "Pormenoriza cada paso."],
    cloze: "El informe debe ___ los costes de cada fase.",
    tip: "Viene de «pormenor», cada detalle menor de algo."
  },
  {
    id: "es-verosimil", lang: "es", word: "verosímil", type: "adjetivo", register: "literario",
    def: "Que parece verdadero y se puede creer.",
    gloss: "plausible, believable",
    example: "La excusa no era muy verosímil.",
    synonyms: ["creíble", "plausible", "probable"],
    upgrade: ["La historia parece que podría ser real.", "La historia es verosímil."],
    cloze: "Para que una novela funcione, sus personajes tienen que ser ___.",
    tip: "No significa «verdadero», sino «con apariencia de verdad». Una mentira puede ser verosímil."
  },
  {
    id: "es-colegir", lang: "es", word: "colegir", type: "verbo", register: "literario",
    def: "Llegar a una conclusión a partir de algo que se sabe o se observa.",
    gloss: "to infer, to deduce",
    example: "De sus palabras colegí que no estaba contento.",
    synonyms: ["deducir", "inferir", "concluir"],
    upgrade: ["Por lo que dijo, me imaginé que no vendría.", "De lo que dijo, colegí que no vendría."],
    cloze: "Por las huellas en la nieve, el detective pudo ___ que eran dos personas.",
    tip: "Se conjuga como «elegir»: colijo, coliges, colige."
  },
  {
    id: "es-reticente", lang: "es", word: "reticente", type: "adjetivo", register: "cotidiano",
    def: "Que muestra reserva o desconfianza; que no está dispuesto del todo a algo.",
    gloss: "reluctant, reticent",
    example: "Al principio estaba reticente a cambiar de método.",
    synonyms: ["reacio", "renuente", "receloso"],
    upgrade: ["No tenía muchas ganas de aceptar.", "Se mostraba reticente a aceptar."],
    cloze: "Los vecinos se mostraron ___ ante el nuevo proyecto.",
    tip: "En origen significa «que calla algo» (reticencia = decir solo parte). Hoy se usa sobre todo como «reacio»."
  },
  {
    id: "es-dilucidar", lang: "es", word: "dilucidar", type: "verbo", register: "académico",
    def: "Aclarar y explicar un asunto complicado o dudoso.",
    gloss: "to elucidate, to clarify",
    example: "La investigación intenta dilucidar las causas del accidente.",
    synonyms: ["esclarecer", "aclarar", "desentrañar"],
    upgrade: ["Queremos saber bien qué pasó.", "Queremos dilucidar qué pasó."],
    cloze: "El tribunal deberá ___ quién tiene razón.",
    tip: "Comparte raíz con «lúcido» y «luz»: arrojar luz sobre algo."
  },
  {
    id: "es-tacito", lang: "es", word: "tácito", type: "adjetivo", register: "académico",
    def: "Que no se dice expresamente pero se entiende o se supone.",
    gloss: "tacit, unspoken",
    example: "Había un acuerdo tácito: nadie hablaba del tema.",
    synonyms: ["implícito", "sobreentendido", "callado"],
    upgrade: ["Todos lo sabíamos aunque nadie lo dijo.", "Era un acuerdo tácito."],
    cloze: "Su silencio fue una aprobación ___.",
    tip: "Del latín «tacere», callar. Lo contrario es «explícito»."
  },
  {
    id: "es-ahondar", lang: "es", word: "ahondar", type: "verbo", register: "académico",
    def: "Profundizar en un tema, estudiarlo a fondo.",
    gloss: "to delve into",
    example: "En el siguiente capítulo ahondaremos en este concepto.",
    synonyms: ["profundizar", "indagar", "investigar"],
    upgrade: ["Vamos a hablar más de este tema.", "Vamos a ahondar en este tema."],
    cloze: "La película no llega a ___ en la psicología del personaje.",
    tip: "Se construye con «en»: ahondar en algo. Viene de «hondo»."
  },
  {
    id: "es-entranable", lang: "es", word: "entrañable", type: "adjetivo", register: "cotidiano",
    def: "Muy querido, que despierta cariño y ternura.",
    gloss: "endearing, cherished",
    example: "Guardo recuerdos entrañables de aquel verano.",
    synonyms: ["querido", "afectuoso", "tierno"],
    upgrade: ["Fue una reunión muy bonita y cariñosa.", "Fue una reunión entrañable."],
    cloze: "Mi abuela tiene una manera ___ de contar historias.",
    tip: "De «entrañas»: algo que se lleva muy adentro."
  },
  {
    id: "es-coyuntura", lang: "es", word: "coyuntura", type: "sustantivo", register: "profesional",
    def: "Conjunto de circunstancias de un momento determinado.",
    gloss: "juncture, current situation",
    example: "En la coyuntura actual, conviene ser prudentes.",
    synonyms: ["circunstancia", "situación", "contexto"],
    upgrade: ["Con cómo están las cosas ahora...", "En la coyuntura actual..."],
    cloze: "Aprovechó la ___ económica para lanzar su negocio.",
    tip: "También significa articulación entre huesos: el punto donde las cosas se unen."
  },
  {
    id: "es-desidia", lang: "es", word: "desidia", type: "sustantivo", register: "literario",
    def: "Falta de cuidado, interés o esfuerzo; dejadez.",
    gloss: "apathy, negligence",
    example: "El edificio se deterioró por la desidia de los propietarios.",
    synonyms: ["dejadez", "apatía", "negligencia"],
    upgrade: ["Lo hizo mal porque le daba igual.", "Lo hizo con desidia."],
    cloze: "La ___ de la administración dejó el parque abandonado.",
    tip: "Es más fuerte que «pereza»: implica abandono de algo que deberías cuidar."
  },
  {
    id: "es-serendipia", lang: "es", word: "serendipia", type: "sustantivo", register: "cotidiano",
    def: "Hallazgo valioso que se produce por casualidad mientras se buscaba otra cosa.",
    gloss: "serendipity",
    example: "La penicilina se descubrió por serendipia.",
    synonyms: ["chiripa", "hallazgo afortunado", "casualidad"],
    upgrade: ["Lo encontré de casualidad y fue genial.", "Fue pura serendipia."],
    cloze: "Conocerse en aquel tren fue una auténtica ___.",
    tip: "Viene de un cuento persa, «Los tres príncipes de Serendip», cuyos protagonistas hacían descubrimientos por azar."
  },
  {
    id: "es-pragmatico", lang: "es", word: "pragmático", type: "adjetivo", register: "profesional",
    def: "Que se centra en lo práctico y útil más que en lo teórico o ideal.",
    gloss: "pragmatic",
    example: "Tomó una decisión pragmática: aceptar el trato.",
    synonyms: ["práctico", "realista", "funcional"],
    upgrade: ["Ella va a lo práctico.", "Ella es muy pragmática."],
    cloze: "Seamos ___: no tenemos tiempo para el plan perfecto.",
    tip: "Del griego «prâgma», acción, hecho."
  },
  {
    id: "es-sobrellevar", lang: "es", word: "sobrellevar", type: "verbo", register: "cotidiano",
    def: "Soportar con paciencia una situación difícil.",
    gloss: "to cope with, to bear",
    example: "Sobrellevó la enfermedad con mucho humor.",
    synonyms: ["soportar", "aguantar", "afrontar"],
    upgrade: ["Lo aguantó como pudo.", "Lo sobrellevó con entereza."],
    cloze: "La música le ayudó a ___ los meses de confinamiento.",
    tip: "Tiene un matiz de dignidad: no solo aguantar, sino llevar el peso con entereza."
  },
  {
    id: "es-ufano", lang: "es", word: "ufano", type: "adjetivo", register: "literario",
    def: "Orgulloso, satisfecho de sí mismo; a veces, presumido.",
    gloss: "proud, smug",
    example: "Salió ufano del examen.",
    synonyms: ["orgulloso", "satisfecho", "engreído"],
    upgrade: ["Iba muy contento y orgulloso.", "Iba muy ufano."],
    cloze: "Tras ganar la partida, se paseaba ___ por la casa.",
    tip: "Puede ser positivo (satisfecho) o algo irónico (creído), según el contexto."
  },

  // ───────────── ENGLISH ─────────────
  {
    id: "en-refine", lang: "en", word: "refine", type: "verb", register: "académico",
    def: "To improve something by making small, careful changes so it becomes more precise.",
    gloss: "pulir, perfeccionar",
    example: "We need to refine the research question.",
    synonyms: ["polish", "fine-tune", "hone"],
    upgrade: ["We need to make the idea a bit better.", "We need to refine the idea."],
    cloze: "After the feedback, she spent a week trying to ___ her essay.",
    tip: "Originally used for purifying metals and sugar: you remove what isn't needed."
  },
  {
    id: "en-nuance", lang: "en", word: "nuance", type: "noun", register: "académico",
    def: "A subtle difference in meaning, expression or tone.",
    gloss: "matiz",
    example: "Translation often loses the nuances of the original text.",
    synonyms: ["subtlety", "shade", "distinction"],
    upgrade: ["It's not that simple, there are small differences.", "It's a matter of nuance."],
    cloze: "A good actor can convey every ___ of a character's mood.",
    tip: "Borrowed from French: «nuance» = shade of colour. Same idea as Spanish «matiz»."
  },
  {
    id: "en-thorough", lang: "en", word: "thorough", type: "adjective", register: "profesional",
    def: "Complete and careful, paying attention to every detail.",
    gloss: "minucioso, exhaustivo",
    example: "The doctor gave me a thorough examination.",
    synonyms: ["meticulous", "comprehensive", "rigorous"],
    upgrade: ["She checked everything really well.", "She was very thorough."],
    cloze: "Before publishing, do a ___ check for spelling mistakes.",
    tip: "Pronunciation: /ˈθʌrə/. Don't confuse with «through» or «though»."
  },
  {
    id: "en-concise", lang: "en", word: "concise", type: "adjective", register: "académico",
    def: "Giving a lot of information clearly in a few words.",
    gloss: "conciso",
    example: "Keep your answers concise and to the point.",
    synonyms: ["brief", "succinct", "to the point"],
    upgrade: ["Make it short and clear.", "Make it concise."],
    cloze: "The abstract should be ___: no more than 200 words.",
    tip: "Positive word: short AND complete. «Curt» is short but rude."
  },
  {
    id: "en-ubiquitous", lang: "en", word: "ubiquitous", type: "adjective", register: "académico",
    def: "Seeming to be everywhere at the same time.",
    gloss: "omnipresente, ubicuo",
    example: "Smartphones have become ubiquitous.",
    synonyms: ["omnipresent", "pervasive", "everywhere"],
    upgrade: ["You can find it everywhere now.", "It has become ubiquitous."],
    cloze: "Coffee shops are ___ in this part of the city.",
    tip: "From Latin «ubique», everywhere. Pronounced /juːˈbɪkwɪtəs/."
  },
  {
    id: "en-mitigate", lang: "en", word: "mitigate", type: "verb", register: "profesional",
    def: "To make something bad less severe or harmful.",
    gloss: "mitigar, paliar",
    example: "Planting trees can mitigate the effects of heat waves.",
    synonyms: ["alleviate", "reduce", "ease"],
    upgrade: ["We want to make the risk smaller.", "We want to mitigate the risk."],
    cloze: "The company took steps to ___ the damage to its reputation.",
    tip: "Very common in reports: «risk mitigation», «mitigating factors»."
  },
  {
    id: "en-compelling", lang: "en", word: "compelling", type: "adjective", register: "cotidiano",
    def: "So interesting or convincing that you pay attention or believe it.",
    gloss: "convincente, cautivador",
    example: "She made a compelling argument for the change.",
    synonyms: ["convincing", "persuasive", "gripping"],
    upgrade: ["The story was really interesting, I couldn't stop.", "It was a compelling story."],
    cloze: "The documentary presents ___ evidence that the plan worked.",
    tip: "Works for arguments (convincente) and stories (absorbente)."
  },
  {
    id: "en-feasible", lang: "en", word: "feasible", type: "adjective", register: "profesional",
    def: "Possible to do or achieve in practice.",
    gloss: "viable, factible",
    example: "Is it feasible to finish by Friday?",
    synonyms: ["viable", "achievable", "workable"],
    upgrade: ["Can we really do it?", "Is it feasible?"],
    cloze: "Before investing, they ran a ___ study.",
    tip: "«Feasibility study» = estudio de viabilidad."
  },
  {
    id: "en-pivotal", lang: "en", word: "pivotal", type: "adjective", register: "académico",
    def: "Of crucial importance because other things depend on it.",
    gloss: "crucial, clave",
    example: "She played a pivotal role in the project.",
    synonyms: ["crucial", "key", "decisive"],
    upgrade: ["It was a very important moment.", "It was a pivotal moment."],
    cloze: "The 1969 moon landing was a ___ moment in history.",
    tip: "A pivot is the point something turns on. A pivotal moment is when everything turns."
  },
  {
    id: "en-elusive", lang: "en", word: "elusive", type: "adjective", register: "literario",
    def: "Difficult to find, catch, achieve or remember.",
    gloss: "esquivo, difícil de alcanzar",
    example: "Success remained elusive for years.",
    synonyms: ["slippery", "evasive", "hard to pin down"],
    upgrade: ["It's hard to get.", "It's elusive."],
    cloze: "The perfect work-life balance can feel ___.",
    tip: "Related to Spanish «eludir»."
  },
  {
    id: "en-scrutinize", lang: "en", word: "scrutinize", type: "verb", register: "académico",
    def: "To examine something very carefully to find information or errors.",
    gloss: "escudriñar, examinar a fondo",
    example: "Journalists scrutinized every word of the speech.",
    synonyms: ["examine", "inspect", "analyze"],
    upgrade: ["They looked very carefully at the contract.", "They scrutinized the contract."],
    cloze: "Investors will ___ the figures before making a decision.",
    tip: "Same root as Spanish «escrutinio» (counting votes)."
  },
  {
    id: "en-foster", lang: "en", word: "foster", type: "verb", register: "profesional",
    def: "To encourage the development of something, such as an idea or a feeling.",
    gloss: "fomentar, propiciar",
    example: "Teachers should foster curiosity.",
    synonyms: ["encourage", "promote", "nurture"],
    upgrade: ["We want to help people work together more.", "We want to foster collaboration."],
    cloze: "Team lunches help ___ a sense of community.",
    tip: "Also «foster family» (familia de acogida): caring for something so it grows."
  },
  {
    id: "en-cumbersome", lang: "en", word: "cumbersome", type: "adjective", register: "cotidiano",
    def: "Large, heavy or complicated, and therefore difficult to use.",
    gloss: "engorroso, aparatoso",
    example: "The application process is cumbersome.",
    synonyms: ["clunky", "unwieldy", "awkward"],
    upgrade: ["The process is long and annoying.", "The process is cumbersome."],
    cloze: "Carrying that ___ suitcase up the stairs was a nightmare.",
    tip: "Works for objects (bulky) and processes (overly complicated)."
  },
  {
    id: "en-streamline", lang: "en", word: "streamline", type: "verb", register: "profesional",
    def: "To make a process simpler and more efficient.",
    gloss: "agilizar, simplificar",
    example: "We streamlined the onboarding process.",
    synonyms: ["simplify", "optimize", "speed up"],
    upgrade: ["We made the process easier and faster.", "We streamlined the process."],
    cloze: "The new software will ___ how we handle invoices.",
    tip: "Originally, a «streamlined» shape lets water or air flow without resistance."
  },
  {
    id: "en-insightful", lang: "en", word: "insightful", type: "adjective", register: "académico",
    def: "Showing a deep and clear understanding of something.",
    gloss: "perspicaz, revelador",
    example: "Thanks for your insightful comments.",
    synonyms: ["perceptive", "astute", "illuminating"],
    upgrade: ["Your comment was really smart and helpful.", "Your comment was very insightful."],
    cloze: "The book offers an ___ look at life in the 1920s.",
    tip: "«Insight» = comprensión profunda. A very useful word for feedback."
  },
  {
    id: "en-wary", lang: "en", word: "wary", type: "adjective", register: "cotidiano",
    def: "Careful because you think something might be dangerous or a problem.",
    gloss: "receloso, cauteloso",
    example: "Be wary of offers that seem too good to be true.",
    synonyms: ["cautious", "suspicious", "careful"],
    upgrade: ["I don't really trust him.", "I'm wary of him."],
    cloze: "Cats are often ___ of strangers.",
    tip: "Usually followed by «of»: wary of something."
  },
  {
    id: "en-tackle", lang: "en", word: "tackle", type: "verb", register: "cotidiano",
    def: "To make a determined effort to deal with a problem or task.",
    gloss: "abordar, afrontar",
    example: "We need to tackle climate change urgently.",
    synonyms: ["address", "deal with", "confront"],
    upgrade: ["Let's start doing something about this problem.", "Let's tackle this problem."],
    cloze: "Let's ___ the hardest task first while we're fresh.",
    tip: "In sport, a tackle is going straight for the ball. Same energy with problems."
  },
  {
    id: "en-meticulous", lang: "en", word: "meticulous", type: "adjective", register: "profesional",
    def: "Very careful and precise, paying attention to every small detail.",
    gloss: "meticuloso",
    example: "He keeps meticulous records of his expenses.",
    synonyms: ["thorough", "precise", "scrupulous"],
    upgrade: ["She's very careful with details.", "She's meticulous."],
    cloze: "The restoration required ___ work on every brushstroke.",
    tip: "Easy cognate with Spanish «meticuloso». Use it in CVs and references."
  },
  {
    id: "en-ambiguous", lang: "en", word: "ambiguous", type: "adjective", register: "académico",
    def: "Having more than one possible meaning; not clear.",
    gloss: "ambiguo",
    example: "The ending of the film is deliberately ambiguous.",
    synonyms: ["unclear", "vague", "equivocal"],
    upgrade: ["The instructions can mean different things.", "The instructions are ambiguous."],
    cloze: "His answer was so ___ that nobody knew if he agreed.",
    tip: "Noun: «ambiguity». Opposite: «unambiguous», «clear-cut»."
  },
  {
    id: "en-convey", lang: "en", word: "convey", type: "verb", register: "académico",
    def: "To express or communicate a feeling, idea or message.",
    gloss: "transmitir, comunicar",
    example: "The painting conveys a sense of loneliness.",
    synonyms: ["communicate", "express", "get across"],
    upgrade: ["The photo shows that people were very sad.", "The photo conveys deep sadness."],
    cloze: "It's hard to ___ tone in a text message.",
    tip: "Great alternative to overusing «show» or «say» in essays."
  },
  {
    id: "en-undermine", lang: "en", word: "undermine", type: "verb", register: "profesional",
    def: "To gradually weaken something or make it less effective.",
    gloss: "socavar, menoscabar",
    example: "Constant criticism can undermine your confidence.",
    synonyms: ["weaken", "erode", "sabotage"],
    upgrade: ["The scandal made people trust him less.", "The scandal undermined his credibility."],
    cloze: "Leaking the plan would ___ the whole negotiation.",
    tip: "Literally, digging a mine under a wall so it collapses."
  },
  {
    id: "en-keen", lang: "en", word: "keen", type: "adjective", register: "cotidiano",
    def: "Very interested in or enthusiastic about something; also, sharp or intense.",
    gloss: "entusiasta, con ganas; agudo",
    example: "I'm keen to learn more about it.",
    synonyms: ["eager", "enthusiastic", "sharp"],
    upgrade: ["I really want to start.", "I'm keen to start."],
    cloze: "She's a ___ photographer and never leaves home without her camera.",
    tip: "Very British. «Keen on» = aficionado a. «A keen eye» = buen ojo."
  },
  {
    id: "en-bolster", lang: "en", word: "bolster", type: "verb", register: "académico",
    def: "To support or strengthen something.",
    gloss: "reforzar, respaldar",
    example: "The new data bolsters our hypothesis.",
    synonyms: ["reinforce", "strengthen", "boost"],
    upgrade: ["This makes my argument stronger.", "This bolsters my argument."],
    cloze: "Winning the first match helped ___ the team's morale.",
    tip: "A bolster is a long pillow: something that props you up."
  },
  {
    id: "en-overwhelm", lang: "en", word: "overwhelm", type: "verb", register: "cotidiano",
    def: "To affect someone very strongly, so they find it hard to cope.",
    gloss: "abrumar, agobiar",
    example: "I was overwhelmed by the amount of work.",
    synonyms: ["swamp", "overpower", "flood"],
    upgrade: ["I have too many things and I can't handle it.", "I feel overwhelmed."],
    cloze: "Don't let a long to-do list ___ you: start with one task.",
    tip: "Can be positive too: «overwhelmed with joy» = desbordado de alegría."
  },
  {
    id: "en-assess", lang: "en", word: "assess", type: "verb", register: "profesional",
    def: "To judge or decide the amount, value, quality or importance of something.",
    gloss: "evaluar, valorar",
    example: "We need to assess the risks before we start.",
    synonyms: ["evaluate", "gauge", "appraise"],
    upgrade: ["Let's see how good the plan is.", "Let's assess the plan."],
    cloze: "Teachers ___ students through projects as well as exams.",
    tip: "Noun: «assessment» (evaluación). Very frequent at university."
  },
  {
    id: "en-resilient", lang: "en", word: "resilient", type: "adjective", register: "académico",
    def: "Able to recover quickly from difficulties.",
    gloss: "resiliente, con capacidad de recuperación",
    example: "Children are often more resilient than we think.",
    synonyms: ["tough", "adaptable", "hardy"],
    upgrade: ["She gets over bad things quickly.", "She's very resilient."],
    cloze: "Local businesses proved surprisingly ___ during the crisis.",
    tip: "From Latin «resilire», to jump back, like a spring."
  },
  {
    id: "en-leverage", lang: "en", word: "leverage", type: "verb", register: "profesional",
    def: "To use something you have to get the maximum advantage.",
    gloss: "aprovechar, sacar partido de",
    example: "We can leverage our network to find partners.",
    synonyms: ["exploit", "capitalize on", "make the most of"],
    upgrade: ["We can use what we already know.", "We can leverage our experience."],
    cloze: "Startups often ___ social media to reach customers cheaply.",
    tip: "A lever (palanca) multiplies force. Business jargon: use it, but not in every sentence."
  },
  {
    id: "en-consistent", lang: "en", word: "consistent", type: "adjective", register: "académico",
    def: "Always behaving or happening in the same way; also, in agreement with something.",
    gloss: "constante, coherente",
    example: "Learning a language requires consistent practice.",
    synonyms: ["steady", "regular", "coherent"],
    upgrade: ["He always does it the same good way.", "His work is consistent."],
    cloze: "Five minutes of ___ daily practice beats two hours once a month.",
    tip: "False friend! «Consistent» ≠ «consistente» (sólido). It means constante o coherente."
  },
  {
    id: "en-outline", lang: "en", word: "outline", type: "verb", register: "académico",
    def: "To describe the main facts or points of something without the details.",
    gloss: "esbozar, resumir a grandes rasgos",
    example: "First, I'll outline the main argument.",
    synonyms: ["summarize", "sketch", "set out"],
    upgrade: ["I'll tell you the main idea quickly.", "Let me outline the main idea."],
    cloze: "In the introduction, briefly ___ the structure of your essay.",
    tip: "As a noun, «outline» is the esquema you write before an essay."
  },
  {
    id: "en-daunting", lang: "en", word: "daunting", type: "adjective", register: "cotidiano",
    def: "Seeming difficult and making you feel less confident.",
    gloss: "abrumador, intimidante",
    example: "Starting a new job can be daunting.",
    synonyms: ["intimidating", "overwhelming", "formidable"],
    upgrade: ["The task looks very scary and hard.", "The task looks daunting."],
    cloze: "Writing a whole thesis felt ___ at first.",
    tip: "Classic phrase: «a daunting task». Undaunted = sin dejarse intimidar."
  },
];
