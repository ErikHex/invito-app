# Instrucciones para crear plantillas compatibles con Invito

Documento para entregar completo a una IA junto con tu idea visual. Basado en el repositorio revisado el 28 de septiembre de 2026: Next.js 16.3.5, React 19.2.8, JavaScript, App Router, CSS Modules y Tailwind CSS 4. GSAP ya está instalado y es opcional.

La compatibilidad se demuestra con la integración y las verificaciones de este documento. No afirmes «100 % compatible» si solamente generaste una imagen, HTML independiente o código sin probar. Si el repositorio cambia, comprueba primero el contrato vigente.

## 1. Encargo para la IA

Actúa como desarrollador de plantillas de invitaciones para Invito. Crea una plantilla React completa, reutilizable y adaptable a móvil, compatible con el contrato descrito aquí. Cambia la presentación visual conservando los datos, módulos y comportamiento de la plataforma.

Completa este breve encargo antes de generar el diseño; si faltan preferencias visuales, elige valores coherentes:

```text
Nombre comercial: [ejemplo: Jardín]
Identificador único: [ejemplo: jardin]
Carpeta: [ejemplo: jardin]
Componente: [ejemplo: Jardin]
Estilo visual: [describe estética, composición, tipografía y animaciones]
Referencias visuales: [opcionales]
Color inicial deseado: [opcional]
Celebraciones principales: [boda / xv / otro; soportar las tres]
```

Entrega archivos completos con sus rutas, los cambios de integración y las comprobaciones realizadas. No entregues pseudocódigo, botones simulados, secciones pendientes ni datos de un evento fijados dentro del componente.

Si tienes acceso al repositorio, intégrala siguiendo sus instrucciones. Si no lo tienes, genera los archivos de la plantilla y especifica los cambios necesarios; no inventes el contenido de archivos existentes, componentes compartidos o funciones SQL. Marca la integración y las pruebas que no pudiste verificar.

## 2. Archivos que debes consultar

Las rutas siguientes son relativas a la raíz del proyecto:

- `AGENTS.md`: instrucciones locales. Antes de escribir código Next.js, lee la guía correspondiente en `node_modules/next/dist/docs/`; esta versión puede tener cambios de API.
- `package.json`, `jsconfig.json`, `src/app/layout.js` y `src/app/globals.css`: dependencias, alias `@/`, fuentes y estilos generales.
- `src/components/invitaciones/Invitacion.js`: contenedor que abre el sobre y monta la plantilla.
- `src/components/invitaciones/plantillas/registro.js`: relación entre identificadores y componentes.
- `src/components/invitaciones/plantillas/catalogo.js`: catálogo comercial y módulos disponibles.
- `src/components/invitaciones/plantillas/editorial/Editorial.js` y `src/components/invitaciones/plantillas/aura-xv/AuraXV.js`: referencias de composición. Revisa también sus secciones.
- `src/components/invitaciones/compartidos/`: RSVP, QR, música, sobre y transferencia.
- `src/lib/invitation-utils.js`, `src/lib/invitation-theme.js`, `src/lib/aura-xv.js` y `src/lib/sample-invitation.js`: utilidades reales que puedes reutilizar.
- `src/app/dashboard/[slug]/ConfiguracionManager.js` y `GaleriaManager.js`: datos que el usuario puede editar.
- `src/app/muestra/[plantilla]/page.js`, `src/app/preview/[slug]/page.js` y `src/app/rsvp/[token]/page.js`: puntos de entrada.
- `supabase/migrations/` y `database/tests/`: integración vigente con base de datos y pruebas.

El código actual y las migraciones más recientes tienen prioridad sobre documentación antigua. Por ejemplo, `database/invitation_sections.md` conserva anotaciones históricas sobre módulos y plantillas que ya cambiaron. Tampoco copies errores u omisiones de una plantilla existente como si fueran requisitos.

## 3. Estructura de entrega

```text
src/components/invitaciones/plantillas/jardin/
  Jardin.js
  jardin.module.css
  [componentes auxiliares propios, si hacen falta]
public/plantillas/jardin/
  [decoraciones locales opcionales]
```

Además, integra el identificador en `registro.js` y `catalogo.js`, y prepara una migración incremental para habilitarlo en la base de datos. No crees una aplicación independiente, un nuevo `package.json`, otro router ni una página por cada invitación.

Usa identificadores únicos que cumplan `^[a-z][a-z0-9_-]*$`. Mantén el mismo identificador en registro, catálogo, base de datos y URL de muestra. La carpeta puede usar guiones, como `aura-xv`, aunque el identificador sea `aura_xv`.

Exporta por defecto el componente principal. Usa JavaScript y JSX en `.js`, acorde con el proyecto. Puedes usar `'use client'` al inicio; la plantilla ya se monta dentro de la frontera cliente de `Invitacion`. No importes módulos de servidor ni hagas consultas a la base de datos desde el diseño.

## 4. Contrato exacto del componente

```jsx
export default function Jardin({
  datos,
  estado,
  onEstadoChange,
  preview,
  colorFondo,
  colorClaro,
  colorAcento,
}) {
  const cfg = datos.configuracion || {};
  const visible = key => datos.modulos_activos?.[key] !== false;
  // Renderiza aquí todos los módulos descritos en esta guía.
}
```

Este fragmento documenta la firma; no es una plantilla terminada.

| Prop | Contrato |
| --- | --- |
| `datos` | Objeto de invitación; no modificarlo. |
| `estado` | Estado actual gestionado por el contenedor: `pendiente`, `confirmado` o `rechazado`. Es la fuente de verdad después de una respuesta. |
| `onEstadoChange` | Callback del contenedor para actualizar ese estado. Pasarlo intacto al RSVP. |
| `preview` | Si es verdadero, no guardar respuestas ni emitir un pase QR real. |
| `colorFondo` | Actualmente `#292927`. |
| `colorClaro` | `configuracion.tema.colorClaro` o `#F6F1E7`. |
| `colorAcento` | Color resuelto por `temaInvitacion`; respetar la selección del editor. |

`onEstadoChange` pasa entre componentes cliente; no lo conviertas en una prop enviada desde una página de servidor.

### Campos de `datos`

| Campo | Tipo y uso |
| --- | --- |
| `evento_nombre` | Nombre del evento; respaldo cuando no hay nombres configurados. |
| `nombre` | Nombre del invitado, no del festejado. |
| `estado` | Estado inicial; para la interacción usa la prop `estado`. |
| `acompanantes` | Número de acompañantes; los boletos son acompañantes + 1. Admitir cero. |
| `mesa_nombre` | Texto opcional; omitir su bloque si falta. |
| `token` | Token de invitación real; puede faltar por completo en muestras y preview. |
| `id`, `checked_in` | Pueden llegar en invitaciones reales; no requerirlos para el diseño. |
| `plantilla` | Identificador del registro. |
| `plantilla_version` | Puede venir de la base de datos; el frontend actualmente elige por identificador, no por versión. No prometer selección de versiones. |
| `modulos_activos` | Objeto de booleanos opcional. Solamente `false` desactiva una sección. |
| `configuracion` | Contenido común descrito a continuación. |

Los nombres de los festejados están en `datos.configuracion.nombres`, **no en `datos.nombres`**. Filtra valores vacíos y usa `datos.evento_nombre` como respaldo. No supongas siempre dos personas ni uses textos exclusivos de bodas para todos los eventos.

## 5. Esquema de contenido común

Ejemplo ficticio de `datos.configuracion` para comprender los tipos. Las URLs son ilustrativas; no incorporarlas como recursos reales ni como valores fijos de la plantilla.

```json
{
  "version": 1,
  "tipoEvento": "boda",
  "encabezado": "Celebremos juntos",
  "nombres": ["Ana", "Luis"],
  "fotoPortada": "https://example.com/portada.jpg",
  "encuadrePortada": "center top",
  "mensajeBase": "Nos encantará compartir este día contigo.",
  "fotoMensaje": "https://example.com/mensaje.jpg",
  "fotoMensajeAlt": "Los festejados en el jardín",
  "fechaHora": "2027-06-19T17:00:00-06:00",
  "zonaHoraria": "America/Mexico_City",
  "ceremonia": {
    "hora": "17:00",
    "lugar": "Lugar de la ceremonia",
    "direccion": "Dirección de ejemplo",
    "foto": null,
    "fotoAlt": null,
    "mapsUrl": "https://maps.google.com/"
  },
  "recepcion": {
    "hora": "19:00",
    "lugar": "Lugar de la recepción",
    "direccion": "Dirección de ejemplo",
    "foto": null,
    "fotoAlt": null,
    "mapsUrl": "https://maps.google.com/"
  },
  "bibliotecaFotos": [],
  "galeria": ["https://example.com/galeria-1.jpg"],
  "itinerario": [
    { "hora": "19:00", "titulo": "Bienvenida", "lugar": "Jardín" }
  ],
  "vestimenta": {
    "codigo": "Formal",
    "descripcion": "Te esperamos con tu mejor estilo.",
    "pinterestUrl": "https://www.pinterest.com/",
    "referencias": [],
    "coloresReservados": []
  },
  "regalos": {
    "mensaje": "Tu compañía es nuestro mejor regalo.",
    "sobres": true,
    "enlaces": [
      { "nombre": "Mesa de regalos", "url": "https://example.com/regalos", "codigo": "ABC123" }
    ],
    "transferencia": { "activa": false, "titular": "", "banco": "", "clabe": "" }
  },
  "musicaUrl": null,
  "tema": { "colorAcento": "#6c538b", "colorClaro": "#F6F1E7" },
  "diseno": {}
}
```

Reglas de lectura:

- Todos los contenidos opcionales deben tolerar ausencia, `null`, textos vacíos y listas vacías. Usa `Array.isArray` para colecciones y descarta entradas nulas. No mostrar imágenes rotas, `undefined`, `NaN` ni tarjetas vacías.
- `tipoEvento` admite `xv`, `boda` y `otro`. Reutiliza `tipoCelebracion(cfg, datos.plantilla)` de `invitation-theme.js`.
- Usa `invitationField(cfg, campo)` de `invitation-utils.js` para campos con respaldo histórico en `cfg.editorial`, especialmente `encabezado`, `mensajeBase`, `fotoMensaje`, `fotoMensajeAlt`, `ceremonia` y `recepcion`. La propiedad común presente, aunque sea `null` o vacía, gana sobre el valor antiguo. No uses `cfg.campo || cfg.editorial?.campo` para estos campos.
- Lee `fotoPortada` directamente de `cfg`; el encuadre se aplica como `objectPosition`, con respaldo histórico `cfg.editorial?.encuadre` cuando corresponda. Los valores actuales del editor son `center`, `center top`, `center bottom`, `left center`, `right center`.
- `galeria` contiene strings URL, no objetos `{ src, alt }`. `bibliotecaFotos` es la biblioteca del editor: no mostrar automáticamente todas sus imágenes como galería.
- `itinerario` contiene objetos con `hora`, `titulo` y `lugar`; no renombrarlos a `time`, `title` o `location`.
- En regalos conservar mensaje, enlaces, código, lluvia de sobres y transferencia. La CLABE es un string para preservar ceros iniciales. Mostrar transferencia solamente si `activa` es verdadera; reutilizar `Transferencia` cuando sea adecuado. Este componente usa CSS de Editorial: revisar su legibilidad sobre el nuevo fondo.
- Respetar `vestimenta.codigo`, `descripcion` y `pinterestUrl`. Validar Pinterest con `pinterestUrl()` de `invitation-utils.js`. Si soportas `coloresReservados`, sus entradas pueden tener `nombre` y `hex`; son datos opcionales, no una condición para renderizar la sección.
- Hay campos reservados en el esquema histórico (`calendario`, `historia`, `informacion`, `hospedaje`, `album`, `cierre`). No prometer controles del editor o módulos disponibles que aún no existen en el catálogo. Las ampliaciones requieren integración adicional explícita.
- No crear un esquema de contenido exclusivo para la nueva plantilla. `diseno` puede alojar ajustes visuales opcionales, pero la plantilla debe funcionar sin ellos; si se necesitan controles nuevos, documentar e implementar su edición como trabajo adicional.

## 6. Módulos obligatorios y responsabilidad

Comprueba cada sección con `datos.modulos_activos?.[clave] !== false`. Si no hay configuración de módulos, conserva el comportamiento activado por defecto. Tener el módulo activo no obliga a dibujar una sección sin contenido.

| Clave | Responsable y contenido |
| --- | --- |
| `sobre` | `Invitacion.js` y `SobreAnimado`: no duplicar dentro de la plantilla. |
| `portada` | Plantilla: encabezado, nombres, foto y encuadre. |
| `mensaje` | Plantilla: mensaje, foto opcional y personalización con el nombre del invitado. |
| `cuenta_regresiva` | Plantilla: usar `fechaHora`; independiente de `portada`. |
| `ceremonia` | Plantilla: hora, lugar, dirección, foto y enlace de mapa. |
| `recepcion` | Plantilla: mismos campos, con su propio interruptor. |
| `vestimenta` | Plantilla: código, descripción e inspiración. |
| `regalos` | Plantilla: mensaje, enlaces y códigos, sobres y transferencia. |
| `galeria` | Plantilla: fotos seleccionadas en `cfg.galeria`. |
| `itinerario` | Plantilla: lista ordenada de actividades. |
| `rsvp` | Plantilla: montar el componente compartido `RsvpForm`. |
| `qr` | Plantilla: montar `QrCode` solo con confirmación real y token. |
| `musica` | `Invitacion.js` y `Musica`: no duplicar ni reproducir por cuenta propia. |

No coloques una sección dentro del condicional de otra si eso rompe su activación independiente. Si agregas navegación interna, solamente crea enlaces a secciones que realmente se renderizan. Evita títulos de RSVP vacíos cuando tanto el formulario como el pase están ocultos.

### RSVP y QR: integración que debe conservarse

Imports desde la carpeta de la plantilla:

```jsx
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
```

Dentro del render del componente:

```jsx
{datos.mesa_nombre && <p>Tu mesa: <strong>{datos.mesa_nombre}</strong></p>}
<p>Boletos disponibles: {Number(datos.acompanantes ?? 0) + 1}</p>

{visible('rsvp') && (
  <RsvpForm
    invitado={datos}
    estado={estado}
    onEstadoChange={onEstadoChange}
    preview={preview}
  />
)}

{visible('qr') && estado === 'confirmado' && (
  preview ? (
    <p>Vista de muestra. El boleto QR se entrega en una invitación real.</p>
  ) : datos.token ? (
    <QrCode token={datos.token} />
  ) : null
)}
```

`RsvpForm` ya realiza la operación `actualizar_estado_invitado` con `token_input` y `nuevo_estado`; en preview solo actualiza el estado local. No recrear ese guardado ni alterar los valores de estado. `QrCode` codifica el token, no una URL, nombre o identificador inventado. No crear pases reales para muestras públicas.

## 7. Diseño, colores, fechas y rendimiento

- Encapsula los estilos en el CSS Module de la plantilla. No sobrescribas globalmente `body`, `button`, `h1`, `:root` ni clases de otras plantillas. El contenedor debe definir colores legibles aunque el navegador use modo oscuro.
- El contenedor publica `--event-primary` y `--event-accent-text`; usa el primero para detalles y el segundo para texto sobre superficies claras. En fondos oscuros verifica el contraste específicamente: el segundo color está oscurecido para papel claro.
- Respeta `colorAcento` y el editor de color. Si el diseño necesita un color predeterminado distinto, intégralo en `temaInvitacion()` conservando la prioridad de un `tema.colorAcento` válido (`#RRGGBB`). Actualmente los IDs nuevos heredan el dorado genérico. No fijes un color que haga ineficaz el editor o descoordine el sobre.
- El sobre tiene una variante específica para `aura_xv`; una plantilla nueva recibe la variante normal. No supongas que existe una variante con tu identificador.
- Conserva la fecha de calendario escrita por el evento. Reutiliza `fechaInvitacion()` y `tiempoRestante()` de `src/lib/aura-xv.js`, aunque su nombre mencione otra plantilla. Para la cuenta regresiva usa el instante ISO con offset; no reemplaces el huso horario con uno fijo.
- Inicializa la cuenta regresiva de forma estable y actualízala en un efecto; limpia el intervalo al desmontar. Fecha inválida: omitir o mostrar un estado neutro. Evento pasado: cero, sin valores negativos.
- No uses `window`, `document`, `Date.now()` o valores aleatorios para producir HTML inicial diferente entre servidor y cliente. El acceso al navegador va en efectos o eventos. Limpia listeners, observers y animaciones; si usas GSAP, revierte su contexto al desmontar.
- Soporta `prefers-reduced-motion`. El contenido debe seguir visible si una animación no se ejecuta. Evita secuestrar el scroll.
- Verifica móvil desde 320 px, tableta y escritorio, nombres largos, textos extensos y ausencia de fotos. Sin desbordamiento horizontal. Botones accesibles al tacto, foco visible, texto alternativo y HTML semántico.
- Si hay lightbox, debe cerrar con Escape, controlar y devolver el foco y permitir navegación por teclado. No agregues una interacción incompleta solo por estética.
- Las imágenes del cliente pueden venir de hosts externos. Un `<img>` nativo con dimensiones o relación de aspecto, `alt` y carga diferida para imágenes secundarias es compatible con las plantillas actuales. Si usas `next/image`, comprueba la configuración de hosts y sus requisitos reales. Evita cargar la foto principal de manera diferida si es el elemento visual principal.
- Reutiliza fuentes disponibles en el layout o entrega recursos locales con licencia adecuada. No añadas dependencias, scripts CDN, trackers ni librerías de iconos innecesarias.
- Valida URLs antes de renderizar enlaces; puedes reutilizar `enlaceSeguro()` y `enlaceRegalo()` de `aura-xv.js`. Los enlaces externos abiertos en otra pestaña usan `rel="noopener noreferrer"`. No uses `dangerouslySetInnerHTML` con contenido del evento.

## 8. Registrar y habilitar una plantilla

### Frontend

En `src/components/invitaciones/plantillas/registro.js`, conserva todas las entradas actuales y agrega el import dinámico y la nueva clave:

```js
const Jardin = dynamic(() => import('./jardin/Jardin'));
// Dentro del objeto existente Object.freeze({ ... }):
// jardin: Jardin,
```

`dynamic` ya está importado desde `next/dynamic`. No sustituyas el archivo completo por este fragmento. `Invitacion.js` cae en Editorial cuando no encuentra el identificador: ver una invitación renderizada no demuestra que tu registro esté funcionando.

En `catalogo.js`, agrega una entrada a `catalogoPlantillas` cuando componente y base de datos estén listos:

```js
{
  id: 'jardin',
  version: 1,
  nombre: 'Jardín',
  demo: '/muestra/jardin',
  descripcion: 'Diseño botánico con fotografías y detalles naturales.',
}
```

No agregues módulos inventados a `modulosDisponibles` como parte incidental de un diseño. Los selectores administrativos ya consumen el catálogo.

### Base de datos

Agregar únicamente el componente y el catálogo no habilita una plantilla de extremo a extremo. Prepara una migración nueva e incremental, revisando las definiciones vigentes:

1. Amplía la lista permitida de `invito_private.panel(text,jsonb)` tanto en creación de eventos como en cambios de negocio/plantilla. Conserva validaciones de permisos, identificadores nulos o desconocidos y versión 1. Revisa `20260928205317_add_aura_xv_template.sql` y `20260928235900_add_nocturno_template.sql` como antecedentes; no ejecutes una sustitución de texto sin comprobar que coincide con la función vigente.
2. Amplía el `CHECK` de `public.muestras_plantillas.plantilla`, creado en `20260929050838_configurable_template_samples.sql`, sin quitar los identificadores existentes. Inspecciona el nombre real de la restricción antes de modificarla.
3. Crea la fila para el nuevo identificador en `muestras_plantillas`, inicialmente sin asignación si procede. Conserva los triggers de proyección, los permisos por columna y las políticas existentes.
4. Desde Administración → Muestras de la página principal, asigna un evento ficticio marcado `es_muestra`. No asignes un evento de un cliente ni copies invitados o tokens reales. Deja que los triggers rellenen la proyección pública; no construyas su contenido manualmente desde el navegador.
5. Cambiar de plantilla debe conservar `configuracion` y el contenido del evento. No reescribas datos de clientes ni cambies permisos para que el nuevo diseño funcione.

Genera la migración con el flujo de migraciones del repositorio. No edites migraciones antiguas ya aplicadas. Si no puedes consultar o probar la base de datos correspondiente, documenta esa limitación y entrega el cambio pendiente; no afirmes que está desplegado.

### Muestras y rutas

- `/muestra/jardin` necesita tanto la entrada del catálogo como una muestra asignada y `disponible`. Sin muestra pública, la ruta devuelve 404; no lo confundas con un error del componente.
- `/muestra/jardin?portada=1` usa `sampleInvitation(..., { portada: true })`, que desactiva sobre y música. No elimines secciones adicionales basándote en ese parámetro: la ruta ya controla su comportamiento.
- `/preview/[slug]` ofrece una vista autorizada con datos del evento y `preview=true`, sin token real.
- `/rsvp/[token]` obtiene los datos reales con `get_invitacion` y monta `Invitacion`.
- Usa el mecanismo vigente de muestras públicas. No generes un archivo de datos personales para insertar en la página principal ni crees rutas paralelas.

## 9. Verificaciones de aceptación

Antes de declarar terminada la plantilla, entrega una lista con resultado: **verificado**, **falló** o **pendiente**, y evidencia breve.

- [ ] La plantilla se selecciona por su identificador real y no por el fallback Editorial.
- [ ] `npm run lint` y `npm run build` terminan correctamente; distinguir problemas nuevos de errores previos del repositorio. No inventar un comando de tests que no existe en `package.json`.
- [ ] Se ve correctamente a 320, 390, 768 y 1440 px, con nombres largos, listas vacías y sin fotografías.
- [ ] Se probaron `boda`, `xv` y `otro`, incluyendo uno y varios nombres.
- [ ] Cada interruptor oculta su propio módulo. Desactivar portada mantiene la cuenta regresiva si sigue activa. Desactivar ceremonia o recepción elimina también sus tarjetas y enlaces.
- [ ] Cambios del editor en textos, fotos, encuadre, fecha, lugares, itinerario, vestimenta, Pinterest, regalos y color se reflejan en el diseño.
- [ ] Borrar un campo no recupera accidentalmente su valor histórico de `editorial`.
- [ ] Preview y muestra funcionan sin `token`, `id` ni `mesa_nombre`; confirmar/rechazar solo cambia el estado local y no hace escrituras.
- [ ] En un evento de prueba autorizado, RSVP guarda la respuesta mediante el componente compartido; QR aparece únicamente con estado confirmado, módulo activo y token real. Un rechazo lo oculta.
- [ ] Boletos = acompañantes + 1; cero acompañantes muestra un boleto. La mesa se muestra solo cuando existe.
- [ ] Sobre y música funcionan una sola vez desde el contenedor; no hay reproducción paralela ni errores de hidratación.
- [ ] Cuenta regresiva tolera fecha inválida y pasada; la fecha visible no cambia al abrir desde otra zona horaria.
- [ ] Foco, navegación de teclado, contraste, movimiento reducido y enlaces se comprobaron visualmente.
- [ ] Alta administrativa y cambio de plantilla aceptan el nuevo identificador sin modificar el contenido; identificadores desconocidos, versiones no admitidas y usuarios sin permiso siguen rechazándose.
- [ ] La fila de muestra existe, se puede asignar desde Administración y la muestra pública se actualiza al editar su evento ficticio.
- [ ] Las demás plantillas siguen registradas y operativas.

Las pruebas SQL existentes en `database/tests/aura_xv.sql` y `database/tests/template_samples.sql` sirven de referencia. Algunas comprueban cantidades fijas de tres plantillas: revisarlas al ampliar el catálogo, sin debilitar sus verificaciones de acceso y privacidad. Probar cambios de base de datos en un entorno de prueba apropiado.

## 10. Formato de respuesta final de la IA

Entrega:

1. Nombre, identificador y descripción breve del diseño.
2. Archivos completos creados y cambios exactos de integración.
3. Recursos visuales incluidos y cualquier dependencia nueva justificada.
4. Migración preparada y estado real de aplicación.
5. URLs de preview/muestra que efectivamente se pudieron comprobar.
6. Resultados de las verificaciones, indicando lo que sigue pendiente.

Una propuesta visual puede ser libre en estética, orden y composición. El contrato de datos, los interruptores independientes, el editor, RSVP, QR, privacidad de muestras y registro son obligatorios.
