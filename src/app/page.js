import Link from "next/link";
import { catalogoPlantillas } from "@/components/invitaciones/plantillas/catalogo";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import { accountDestination, accountName } from "@/lib/account";

const features = [
  [
    "✳",
    "Lista para tu celebración",
    "Personalizamos el diseño que elijas con tus fotos, textos y detalles. Recibes tu invitación publicada y lista para compartir.",
  ],
  [
    "↗",
    "Actualiza tus datos",
    "Cambia la información de tu evento desde tu cuenta. Tus invitados pueden consultar los cambios en el mismo enlace.",
  ],
  [
    "✓",
    "Confirmaciones al día",
    "Consulta quién confirmó y quién falta, con una lista de invitados que se actualiza automáticamente.",
  ],
  [
    "◇",
    "Cada quien en su lugar",
    "Administra lugares asignados y mesas desde tu cuenta para organizar a tus invitados.",
  ],
  [
    "✧",
    "Pases para dar la bienvenida",
    "Al confirmar, tus invitados pueden consultar su pase QR y la mesa asignada. Usa el lector para registrar su acceso.",
  ],
  [
    "❧",
    "Todos los detalles, sin papel",
    "Comparte ubicaciones, itinerario, galería y más en una invitación pensada para disfrutarse desde el celular.",
  ],
  [
    "♡",
    "Álbum compartido",
    "Tus invitados pueden compartir las fotografías que capturen durante la celebración en un álbum digital del evento.",
  ],
];

const steps = [
  [
    "Cuéntanos tu celebración",
    "Nos compartes tus fotos, textos y los datos del evento.",
  ],
  [
    "Le damos forma",
    "Personalizamos tu invitación sobre el diseño que elijas.",
  ],
  [
    "Revisa cada detalle",
    "Incluimos dos rondas de ajustes antes de la entrega.",
  ],
  [
    "Comparte y organiza",
    "Recibes tu enlace y acceso a tu cuenta para actualizar datos y gestionar invitados.",
  ],
];

export default async function HomePage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  const { data: session } = user
    ? await client.rpc("panel_operacion", { operacion: "sesion", datos: {} })
    : { data: null };
  const { data: muestras } = await client.from('muestras_plantillas').select('plantilla').eq('disponible', true);
  // A new template can safely reuse an existing public fictional sample until
  // its own database assignment is deployed. Never use a non-public event.
  const plantillasConMuestra = catalogoPlantillas.filter(plantilla =>
    muestras?.some(muestra => muestra.plantilla === plantilla.id) ||
    (plantilla.id === 'cronica_encantada' && muestras?.length > 0),
  );
  const destination = accountDestination(session);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Invito, inicio"
        >
          invito<svg className={styles.brandMark} viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M24 4C12 12 6 21 8 32c2 9 10 15 16 20 6-5 14-11 16-20 2-11-4-20-16-28Z" stroke="currentColor" strokeWidth="2.8"/><path d="M24 12v29M13 27l11 10 11-10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="8" r="2.5" fill="currentColor"/></svg>
        </Link>
        <nav
          className={styles.nav}
          aria-label="Navegación principal"
        >
          <a href="#plantillas" className={styles.navLink}>Plantillas</a>
          <a
            href="#detalles"
            className={styles.navLink}
          >
            Los detalles
          </a>
          <a
            href="#paquete"
            className={styles.navLink}
          >
            Tu invitación
          </a>
          <div className={styles.account}>
            {user && (
              <p className={styles.greeting}>
                Hola, {accountName(user)}
                <span>Sesión iniciada</span>
              </p>
            )}
            <Link
              href={user ? destination.href : "/login"}
              className={styles.secondary}
            >
              {user ? destination.label : "Iniciar sesión"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </header>

      <section
        className={styles.hero}
        aria-labelledby="hero-title"
      >
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>INVITACIONES DIGITALES INTERACTIVAS</p>
          <h1 id="hero-title">
            Una invitación hermosa.
            <br />
            <em>Todo tu evento organizado.</em>
          </h1>
          <p className={styles.description}>
            Sorprende a tus invitados con una invitación interactiva y organiza tu celebración desde un solo lugar: confirmaciones, pases QR, mesas y un álbum de fotos compartido.
          </p>
          <div className={styles.actions}>
            <a
              href="https://wa.me/525669281968?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20mi%20invitaci%C3%B3n%20digital%20Invito"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primary}
            >
              Cotizar por WhatsApp <span aria-hidden="true">↗</span>
            </a>
            <Link
              href="#plantillas"
              className={styles.textLink}
            >
              Ver invitaciones reales <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className={styles.heroNote}>
            Bodas · XV años · Cumpleaños · Pago único desde $699 MXN
          </p>
        </div>
        <div className={styles.heroArt} aria-label="Demostración de una invitación interactiva de Invito y un panel ilustrativo de gestión">
          <div className={styles.showcaseGlow} aria-hidden="true" />
          <div className={styles.showcaseFlower} aria-hidden="true">✿</div>
          <div className={styles.showcaseFlowerTwo} aria-hidden="true">✾</div>
          <div className={styles.showcasePanel} aria-label="Panel de gestión ilustrativo">
            <div className={styles.showcasePanelNav}><strong>invito</strong><span>Panel de gestión · Ejemplo</span></div>
            <p className={styles.showcasePanelTitle}>Tus invitados, en orden.</p>
            <div className={styles.showcaseStats}><div><strong>✓</strong><span>Confirmaciones</span></div><div><strong>◇</strong><span>Mesas</span></div><div><strong>▦</strong><span>Pases QR</span></div></div>
            <div className={styles.showcasePanelLine}><span>Invitados confirmados</span><b>✓</b></div>
            <div className={styles.showcasePanelLine}><span>Asignación de lugares</span><b>◇</b></div>
            <div className={styles.showcasePanelLine}><span>Álbum compartido</span><b>♡</b></div>
          </div>
          <div className={styles.showcasePhone}>
            <div className={styles.showcaseNotch} aria-hidden="true" />
            <iframe src="/muestra/editorial?portada=1" title="Vista previa de la invitación Editorial de Invito" loading="lazy" tabIndex={-1} />
            <Link href="/muestra/editorial" className={styles.showcaseVisit}>VER INVITACIÓN REAL ↗</Link>
          </div>
          <div className={styles.showcaseRibbon}>Invitaciones que enamoran <span>♡</span></div>
          <p className={styles.artCaption}>INVITACIÓN DE MUESTRA REAL · PANEL ILUSTRATIVO</p>
        </div>
      </section>

      <div className={styles.ribbon}>
        <span aria-hidden="true">✳</span> Tu evento, tu estilo, todos tus
        invitados.<span aria-hidden="true">✳</span>
      </div>

      <section id="plantillas" className={styles.templates} aria-labelledby="templates-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>UNA CELEBRACIÓN. TU FORMA DE CONTARLA.</p>
          <h2 id="templates-title">Encuentra <em>tu estilo.</em></h2>
          <p>Celebraciones de muestra para conocer cada uno de nuestros diseños.
            Abre las invitaciones y descubre sus fotos, detalles y animaciones.</p>
        </div>
        {!plantillasConMuestra.length && <p className={styles.sectionHeading}>Estamos preparando nuevas invitaciones de muestra. Vuelve pronto para descubrirlas.</p>}
        <div className={styles.templateGrid}>
          {plantillasConMuestra.map((plantilla) => (
            <article key={plantilla.id} className={styles.templateCard}>
              <Link href={plantilla.demo} className={styles.templateWindow} aria-label={`Ver invitación completa: ${plantilla.nombre}`}>
                <iframe src={`${plantilla.demo}?portada=1`} title={`Portada de ${plantilla.nombre}`}
                  loading="lazy" tabIndex={-1} aria-hidden="true" />
                <span className={styles.templateOpen}>Explorar invitación ↗</span>
              </Link>
              <div className={styles.templateInfo}>
                <h3>{plantilla.nombre}</h3>
                <p>{plantilla.descripcion}</p>
                <Link href={plantilla.demo} className={styles.textLink}>Ver ejemplo completo <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="detalles"
        className={styles.details}
        aria-labelledby="details-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>
            BONITA POR FUERA. PRÁCTICA EN CADA DETALLE.
          </p>
          <h2 id="details-title">
            Tú celebra.
            <br />
            <em>Cada detalle, en tus manos.</em>
          </h2>
          <p>
            Nosotros preparamos tu invitación. Tú tienes las herramientas para
            mantener todo al día.
          </p>
        </div>
        <div className={styles.features}>
          {features.map(([icon, title, description]) => (
            <article
              key={title}
              className={styles.feature}
            >
              <span
                className={styles.iconBadge}
                aria-hidden="true"
              >
                {icon}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.process}
        aria-labelledby="process-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>DE TU IDEA A SU PANTALLA</p>
          <h2 id="process-title">
            Así empieza <em>tu invitación.</em>
          </h2>
        </div>
        <ol className={styles.steps}>
          {steps.map(([title, description], index) => (
            <li key={title}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="paquete"
        className={styles.package}
        aria-labelledby="package-title"
      >
        <div className={styles.packageIntro}>
          <p className={styles.eyebrow}>
            PREPARADA POR NOSOTROS. EN TUS MANOS.
          </p>
          <h2 id="package-title">
            Una invitación.
            <br />
            <em>Todo un comienzo.</em>
          </h2>
          <p>
            La personalizamos con tus fotos, textos y detalles. Te entregamos el
            enlace y acceso a tu cuenta para actualizar información y organizar
            a tus invitados.
          </p>
          <span
            className={styles.packageFlower}
            aria-hidden="true"
          >
            ✳
          </span>
        </div>
        <div className={styles.packageCard}>
          <p className={styles.eyebrow}>PRECIO DE LANZAMIENTO</p>
          <h3>
            Tu invitación, lista
            <br />
            para compartir.
          </h3>
          <p className={styles.regularPrice}>Precio regular $1,490 MXN</p>
          <p className={styles.price}>
            $699 <span>MXN</span>
          </p>
          <p className={styles.priceNote}>Pago único por evento.</p>
          <ul>
            <li>Personalización del diseño que elijas</li>
            <li>Dos rondas de ajustes antes de la entrega</li>
            <li>Acceso para actualizar la información del evento</li>
            <li>Confirmaciones, lugares asignados y mesas</li>
            <li>Pases QR y herramienta de registro de acceso</li>
            <li>Álbum digital compartido para fotos de tus invitados</li>
            <li>Guía breve para utilizar tu cuenta</li>
          </ul>
          <a
            href="https://wa.me/525669281968?text=Hola%2C%20quiero%20contratar%20la%20invitaci%C3%B3n%20Invito%20de%20%24699"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primary}
          >
            Quiero mi invitación <span aria-hidden="true">↗</span>
          </a>
          <p className={styles.paymentNote}>Paga hasta recibir tus accesos.</p>
          <p className={styles.scopeNote}>
            Tú cargas y envías las invitaciones y operas el registro de acceso.
            Si necesitas que lo hagamos por ti o buscas un diseño desde cero, lo
            cotizamos aparte. La vigencia y el periodo de soporte se acuerdan
            antes de contratar.
          </p>
        </div>
      </section>

      <section
        id="contacto"
        className={styles.contact}
        aria-labelledby="contact-title"
      >
        <span
          className={styles.contactFlower}
          aria-hidden="true"
        >
          ✳
        </span>
        <p className={styles.eyebrow}>
          LAS BUENAS HISTORIAS EMPIEZAN CON UN HOLA
        </p>
        <h2 id="contact-title">
          Hagamos algo <em>para recordar.</em>
        </h2>
        <p>Cuéntanos qué celebras. Armamos tu invitación juntos.</p>
        <div className={styles.actions}>
          <a
            href="https://wa.me/525669281968"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primary}
          >
            Escríbenos por WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <a
            href="mailto:hola@invito.com"
            className={styles.secondary}
          >
            Enviar correo <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Invito, inicio"
        >
          invito<svg className={styles.brandMark} viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M24 4C12 12 6 21 8 32c2 9 10 15 16 20 6-5 14-11 16-20 2-11-4-20-16-28Z" stroke="currentColor" strokeWidth="2.8"/><path d="M24 12v29M13 27l11 10 11-10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="8" r="2.5" fill="currentColor"/></svg>
        </Link>
        <p>Hecho para celebrar lo que importa.</p>
        <span>© {new Date().getFullYear()} Invito</span>
      </footer>
    </main>
  );
}
