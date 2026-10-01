# Diccionario vivo

Una app web sencilla para mejorar tu léxico en **español e inglés** sin que parezca estudiar un diccionario.

## Cómo funciona

Cada día aprendes 5 palabras (3 en español + 2 en inglés). Cada palabra pasa por 5 pasos, y cada paso aplica una técnica de aprendizaje:

| Paso | Qué haces | Técnica |
|---|---|---|
| 1. Adivina | Lees la palabra en una frase y eliges qué crees que significa | Efecto de generación |
| 2. Descubre | Significado, traducción, ejemplo, «sube de nivel», origen, audio y enlace a la RAE / Cambridge | Codificación múltiple |
| 3. Ancla | Creas tu propio gancho de memoria (sonido, imagen, persona) | Palabra clave / mnemotecnia |
| 4. Úsala | Escribes una frase tuya con la palabra | Uso activo |
| 5. Valora | Dices lo bien que la sabes y eso decide cuándo vuelve | Metacognición |

**Practicar** tiene tres modos:

- **Repaso inteligente**: repetición espaciada (cajas de 1, 3, 7, 14 y 30 días, como Anki) y recuerdo activo (escribir la palabra, con pistas). Tras cada acierto valoras Difícil / Bien / Fácil; lo que fallas vuelve en la misma sesión.
- **Contrarreloj**: 60 segundos con combos que multiplican los puntos.
- **Parejas**: une palabras con su traducción contra el reloj.

Además: puntos de experiencia y niveles, racha de días, **Mi léxico** (con tus ganchos, frases y fecha del próximo repaso) y una pestaña **Método** que explica cada técnica.

El progreso se guarda en el navegador (`localStorage`). No necesita servidor ni instalación.

## Usarla

Abre `index.html` en el navegador. Para tenerla en el móvil, puedes activar GitHub Pages en el repositorio.

## Añadir palabras

Todas las palabras están en [`js/words.js`](js/words.js). Copia una entrada, cambia el `id` y rellena los campos (`def`, `gloss`, `example`, `synonyms`, `upgrade`, `cloze` con `___` y `tip`).
