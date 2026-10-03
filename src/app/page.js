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
    "Administra acompañantes y asigna mesas desde tu cuenta para organizar a tus invitados.",
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
  const plantillasConMuestra = catalogoPlantillas.filter(plantilla => muestras?.some(muestra => muestra.plantilla === plantilla.id));
  const destination = accountDestination(session);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Invito, inicio"
        >
          invito<span aria-hidden="true">✳</span>
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
          <p className={styles.eyebrow}>EL COMIENZO DE ALGO ESPECIAL</p>
          <h1 id="hero-title">
            Grandes momentos.
            <br />
            <em>Bonitos comienzos.</em>
          </h1>
          <p className={styles.description}>
            Creamos tu invitación digital y te la entregamos lista para
            compartir. Después, puedes actualizar los datos de tu evento,
            consultar confirmaciones y organizar tus mesas desde tu cuenta.
          </p>
          <div className={styles.actions}>
            <a
              href="#contacto"
              className={styles.primary}
            >
              Quiero mi invitación <span aria-hidden="true">↗</span>
            </a>
            <Link
              href="#plantillas"
              className={styles.textLink}
            >
              Explorar plantillas <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className={styles.heroNote}>
            Bodas · XV años · Cumpleaños · Y todo lo que merece celebrarse
          </p>
        </div>
        <div
          className={styles.heroArt}
          role="img"
          aria-label="Ilustración de una invitación digital en un celular junto a un panel de confirmaciones y organización de mesas."
        >
          <div
            className={styles.productScene}
            aria-hidden="true"
          >
            <div className={styles.orbit} />
            <span className={styles.spark}>✳</span>
            <div className={styles.panelPreview}>
              <div className={styles.previewBar}>
                <span>invito✳</span>
                <span>Tu evento</span>
              </div>
              <p className={styles.previewTitle}>Todo en su lugar.</p>
              <div className={styles.previewStats}>
                <div>
                  <span>✓</span>Confirmaciones
                </div>
                <div>
                  <span>◇</span>Mesas
                </div>
              </div>
              <div className={styles.guestRow}>
                <i />
                <span />
                <b>Confirmado</b>
              </div>
              <div className={styles.guestRow}>
                <i />
                <span />
                <b>Confirmado</b>
              </div>
              <div className={styles.tablePreview}>
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </div>
            </div>
            <div className={styles.phonePreview}>
              <div className={styles.phoneSpeaker} />
              <span className={styles.phoneEyebrow}>UNA OCASIÓN ESPECIAL</span>
              <div className={styles.phoneFlower}>✳</div>
              <p>
                Tenemos algo
                <br />
                <em>que celebrar.</em>
              </p>
              <div className={styles.phoneRule} />
              <span className={styles.phoneNote}>
                Y queremos compartirlo contigo.
              </span>
              <div className={styles.phoneDetails}>
                <span>Fecha</span>
                <span>Lugar</span>
                <span>Detalles</span>
              </div>
              <span className={styles.phoneConfirm}>
                Confirmar asistencia ↗
              </span>
            </div>
            <div className={styles.readyBadge}>
              <span>✓</span> Lista para compartir
            </div>
          </div>
          <p className={styles.artCaption}>
            TU INVITACIÓN Y TUS INVITADOS, CONECTADOS.
          </p>
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
          <p className={styles.price}>
            $699 <span>MXN</span>
          </p>
          <p className={styles.priceNote}>Pago único por evento.</p>
          <ul>
            <li>Personalización del diseño que elijas</li>
            <li>Dos rondas de ajustes antes de la entrega</li>
            <li>Acceso para actualizar la información del evento</li>
            <li>Confirmaciones, acompañantes y mesas</li>
            <li>Pases QR y herramienta de registro de acceso</li>
            <li>Guía breve para utilizar tu cuenta</li>
          </ul>
          <a
            href="#contacto"
            className={styles.primary}
          >
            Quiero mi invitación <span aria-hidden="true">↗</span>
          </a>
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
          invito<span aria-hidden="true">✳</span>
        </Link>
        <p>Hecho para celebrar lo que importa.</p>
        <span>© {new Date().getFullYear()} Invito</span>
      </footer>
    </main>
  );
}
