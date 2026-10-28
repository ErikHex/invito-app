# Sistema de diseño visual Invito

> Guía base para una experiencia editorial, cálida y funcional en landing, dashboard e invitaciones.  
> Alcance inicial: la landing `src/app/page.js` y `src/app/page.module.css`. Este documento evita que las futuras pantallas repliquen estilos de forma inconsistente.

## 1. Principios

1. **Celebración antes que interfaz.** La emoción y la historia del evento guían la composición; la gestión siempre permanece clara.
2. **Editorial, no recargado.** Tipografía con personalidad, espacios amplios y pocos acentos bien elegidos.
3. **La información importante se entiende en un vistazo.** Acciones, estado de RSVP, pases QR y cambios del evento no dependen solo del color.
4. **Móvil primero.** La mayoría de los invitados abre una invitación desde el teléfono; las acciones principales deben funcionar con un pulgar.
5. **Movimiento con propósito.** Las animaciones acompañan, nunca bloquean, distraen ni son indispensables para comprender la pantalla.

## 2. Paleta

Usar variables semánticas. No aplicar colores hexadecimales nuevos directamente en componentes.

```css
:root {
  --invito-ink: #302a39;
  --invito-ink-muted: #746b7c;
  --invito-plum-700: #67437a;
  --invito-plum-600: #79528d;
  --invito-plum-500: #826393;
  --invito-plum-300: #cdb4d6;
  --invito-lilac-100: #f1e4f5;
  --invito-lilac-200: #e8d8ed;
  --invito-blush-100: #f8e9e7;
  --invito-blush-200: #f7d9e9;
  --invito-surface: #fdfcf9;
  --invito-surface-soft: #fffaf9;
  --invito-white: #ffffff;
  --invito-border: #ded8e1;
  --invito-focus: #a587b5;
  --invito-success: #3d7657;
  --invito-warning: #9a6517;
  --invito-danger: #aa3f55;
}
```

- **Fondo base:** `--invito-surface` y variaciones suaves de lila/blush.
- **Texto:** `--invito-ink`; texto secundario `--invito-ink-muted`.
- **Acción principal:** degradado de `--invito-plum-600` a `--invito-plum-700`, texto blanco.
- **Estados:** éxito, advertencia y error deben combinar icono, texto y color.
- Mantener un contraste WCAG AA de al menos 4.5:1 para texto normal y 3:1 para texto grande y controles.

## 3. Tipografía

- **Display:** `var(--font-display), Georgia, serif`. Reservada para titulares, precio y momentos editoriales.
- **UI y cuerpo:** fuente sans del proyecto; fallback del sistema. Para datos, formularios y dashboard se prioriza legibilidad sobre expresividad.
- Titulares: peso 400, `line-height: 1.08–1.2`, `letter-spacing: -0.02em`.
- Cuerpo: 15–16px, `line-height: 1.6–1.9`.
- Eyebrow: 10–12px, semibold, mayúsculas, `letter-spacing: 0.12–0.2em`.
- No usar todo en mayúsculas para párrafos ni reducir texto funcional por debajo de 12px. En invitaciones y dashboard, preferir 14px mínimo.

```css
.invito-title {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.14;
  font-size: clamp(2.4rem, 5vw, 4.75rem);
}
```

## 4. Fondos abstractos

El lenguaje visual usa volúmenes lila, blush y blanco para crear profundidad sin imágenes pesadas.

- Combinar hasta dos gradientes radiales con una base plana o lineal.
- Formas orgánicas: óvalos, cintas y orbes con bordes amplios y opacidad baja.
- Mantener el contenido sobre una superficie legible; el fondo nunca compite con una acción o lectura.
- Crear los fondos en CSS; evitar imágenes rasterizadas decorativas.

```css
.invito-ambient {
  background:
    radial-gradient(ellipse at 12% 12%, rgb(255 250 248) 0%, transparent 48%),
    radial-gradient(ellipse at 100% 75%, rgb(199 163 215 / 0.75) 0%, transparent 58%),
    linear-gradient(145deg, #f6e8ef, #e8d8ed 56%, #f8e9e7);
}
```

## 5. Glassmorphism

El cristal se usa solo para tarjetas elevadas sobre un fondo abstracto.

```css
.invito-glass {
  border: 1px solid rgb(255 255 255 / 0.78);
  border-radius: 1.375rem;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.86), rgb(249 241 249 / 0.79));
  box-shadow: 0 0.875rem 2.5rem rgb(96 68 112 / 0.10);
  backdrop-filter: blur(0.75rem);
  -webkit-backdrop-filter: blur(0.75rem);
}
@supports not ((backdrop-filter: blur(1px))) {
  .invito-glass { background: #fffdfb; }
}
```

- No anidar más de una capa de glassmorphism.
- No usar blur en listas largas, tablas ni superficies que se actualizan frecuentemente.
- En móvil, reducir sombras y desactivar efectos costosos si hay problemas de rendimiento.

## 6. Espaciado, forma y elevación

| Token | Valor | Uso |
|---|---:|---|
| `--space-1` | 4px | separación mínima |
| `--space-2` | 8px | icono + texto |
| `--space-3` | 12px | controles compactos |
| `--space-4` | 16px | padding de tarjetas pequeñas |
| `--space-5` | 24px | tarjetas y grupos |
| `--space-6` | 32px | bloques |
| `--space-8` | 48px | secciones pequeñas |
| `--space-10` | 64px | secciones desktop |
| `--radius-control` | 9px / 999px | campos / CTAs |
| `--radius-card` | 22–30px | tarjetas editoriales |

Usar `max-width: 1240px` para contenedores de landing y `max-width: 1120px` para cuadrículas de contenido. El padding lateral parte de 16–20px móvil y llega a 48px desktop.

## 7. Componentes

### Botones

- **Primario:** CTA comercial o confirmación decisiva. Uno dominante por bloque.
- **Secundario:** contorno o superficie clara; no competir con el primario.
- **Enlace textual:** acciones de exploración o bajo riesgo.
- Área táctil mínima: 44×44px; en la landing se usa 48–51px.
- Estado disabled: conservar texto legible y explicar la razón si el bloqueo no es obvio.

```css
.invito-button-primary {
  min-height: 48px;
  padding: 13px 21px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(110deg, var(--invito-plum-600), var(--invito-plum-700));
  box-shadow: 0 9px 24px rgb(113 70 129 / 0.14);
}
.invito-button-primary:hover { filter: brightness(0.94); }
.invito-button-primary:focus-visible {
  outline: 3px solid var(--invito-focus);
  outline-offset: 4px;
}
```

### Tarjetas

- Borde claro, radio editorial y una sola sombra suave.
- Título, breve contexto y acción en orden visual estable.
- Para estados de dashboard, incluir etiqueta textual además del color.
- No colocar texto crítico sobre una foto sin una capa sólida/gradiente que garantice contraste.

### Formularios y dashboard

- Etiquetas siempre visibles encima del campo; placeholders son ejemplo, no etiqueta.
- Agrupar datos del evento por tarea: Información, Invitados, Mesas, Acceso, Álbum.
- Mostrar guardado, error y sincronización como texto explícito junto a icono.
- Tablas con alternativa de tarjetas en móvil; no depender de scroll horizontal para acciones clave.

### Invitaciones

- La identidad de cada plantilla puede cambiar imágenes, acento y composición, pero conserva:
  - controles accesibles;
  - contraste y jerarquía;
  - CTA RSVP claro;
  - detalles, mapa, horario y pase QR fáciles de encontrar;
  - un modo sin animación y una carga progresiva de galería.

## 8. Responsive mobile-first

1. Crear primero la composición de una columna (`min-width: 0`, contenido de 16–20px).
2. A 440px, las cuadrículas se mantienen en una columna cuando la lectura lo requiera.
3. A 760px, pasar a dos columnas solo si cada tarjeta sigue siendo útil y táctil.
4. A partir de 1024px, usar composición editorial y espacios de sección mayores.
5. Evitar alturas fijas para contenido; los previews y decoraciones pueden limitarse, no los textos.
6. Los iframes de muestra deben ser `loading="lazy"`, no interactivos cuando solo funcionan como vista previa, y acompañarse de un enlace equivalente.

## 9. Accesibilidad

- Navegación semántica: `header`, `nav`, `main`, `section`, `footer`, titulares en orden.
- Todo enlace y control tiene nombre accesible; SVG decorativo lleva `aria-hidden="true"`.
- Focus visible uniforme, con `outline` y no solo cambio de color.
- Respetar `prefers-reduced-motion`; detener animaciones decorativas y evitar parallax esencial.
- No usar color como único indicador de confirmación, error, precio o disponibilidad.
- Mantener orden de teclado igual al orden visual.
- Revisar zoom de 200%, lector de pantalla y contraste AA antes de publicar una vista.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 10. Performance

- Preferir formas, gradientes y SVG simples antes que imágenes decorativas.
- Cargar galerías, previews e iframes fuera de pantalla con lazy loading.
- Usar `next/image` para fotografía editorial y especificar dimensiones/placeholder para evitar CLS.
- Limitar `backdrop-filter`, `filter: blur`, sombras amplias y animaciones simultáneas; validarlos en un teléfono real de gama media.
- Animar solo `transform` y `opacity`; nunca ancho, alto, top/left o sombras en bucles.
- Comprimir y servir imágenes responsivas; no precargar imágenes que no son LCP.
- Mantener la landing libre de consultas de datos innecesarias: separar componentes puramente decorativos de los datos de sesión o muestras.

## 11. Ejemplo de sección

```css
.invito-section {
  padding: 4.75rem 1.125rem;
  background: radial-gradient(ellipse at 90% 20%, rgb(228 202 239 / 0.8), transparent 42%), #fffbfa;
}
.invito-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 48rem) {
  .invito-section { padding-inline: max(3rem, calc((100vw - 70rem) / 2)); }
  .invito-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
}
```

## 12. Plan de extensión

### Fase 1 — Consolidación de landing
- Extraer tokens a variables globales o un módulo de tokens compartido.
- Convertir botones, tarjetas, headings y focus states en componentes reutilizables.
- Auditar móvil, contraste, navegación por teclado, carga y CLS.
- Reemplazar ilustraciones provisionales por demostraciones reales autorizadas.

### Fase 2 — Dashboard
- Aplicar tokens a navegación, formularios, tablas, badges y estados.
- Priorizar flujos de: editar evento, invitados/RSVP, mesas, QR y álbum.
- Introducir tarjetas compactas y feedback de guardado; conservar densidad funcional frente al estilo decorativo.
- Validar cada flujo con teclado, móvil y datos de eventos reales no sensibles.

### Fase 3 — Invitaciones
- Crear una capa compartida para CTA, RSVP, detalles y accesibilidad.
- Permitir variación de tema por plantilla sin duplicar componentes.
- Optimizar imágenes, galería y animaciones según plantilla.
- Probar en iOS Safari, Android Chrome y conexiones lentas.

### Definición de terminado para cada extensión
- UI consistente con estos tokens y patrones.
- Responsive desde 320px; no hay desbordamiento horizontal.
- WCAG AA para texto y controles principales.
- Sin regresiones de datos, auth, RSVP, QR, mesas o álbum.
- Build, lint y preview validados antes de fusionar.
