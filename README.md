# Diccionario vivo

Una app web sencilla para mejorar tu léxico en **español e inglés** sin que parezca estudiar un diccionario.

## Cómo funciona

- **Hoy**: 5 palabras nuevas al día (3 en español + 2 en inglés). Primero intentas adivinar qué significan; después ves el significado, la traducción, un ejemplo, palabras cercanas, una curiosidad y un **«sube de nivel»** (frase normal → frase mejorada).
- **Reto**: escribes una frase tuya con la palabra. Así no solo la reconoces: la usas.
- **Practicar**: preguntas rápidas de 4 tipos (definición, completar la frase, traducción y «¿qué palabra usarías?»).
- **Repaso espaciado**: cada palabra está en una caja del 1 al 5. Si aciertas sube de caja y tarda más en volver (1, 3, 7, 14 y 30 días); si fallas, vuelve a la caja 1.
- **Mi léxico**: todas las palabras que has aprendido, con su nivel y tus frases.
- Racha de días 🔥, pronunciación 🔊 y modo oscuro automático.

El progreso se guarda en el navegador (`localStorage`). No necesita servidor ni instalación.

## Usarla

Abre `index.html` en el navegador. Para tenerla en el móvil, puedes activar GitHub Pages en el repositorio.

## Añadir palabras

Todas las palabras están en [`js/words.js`](js/words.js). Copia una entrada, cambia el `id` y rellena los campos (`def`, `gloss`, `example`, `synonyms`, `upgrade`, `cloze` con `___` y `tip`).
