import { getDashboardData } from "@/app/dashboard/[slug]/dashboard-data";
import Invitacion from "@/components/invitaciones/Invitacion";
import { catalogoPlantillas } from "@/components/invitaciones/plantillas/catalogo";
import Link from "next/link";
import styles from "./preview.module.css";

// This route is opened immediately after an editor save. Rendering it per
// request prevents a stale server payload from differing from the editor.
export const dynamic = "force-dynamic";

export default async function PreviewPage({ params, searchParams }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;
  const query = await searchParams;
  const modelo = catalogoPlantillas.find((p) => p.id === query.plantilla);
  const plantilla = modelo?.id || data.evento.plantilla;
  return (
    <main className={styles.page}>
      <Link
        className={styles.back}
        href={`/dashboard/${slug}/diseno?plantilla=${encodeURIComponent(plantilla)}`}
      >
        ← Volver a edición
      </Link>
      <Invitacion
        preview
        datos={{
          evento_nombre: data.evento.nombre_evento,
          configuracion: data.evento.configuracion,
          plantilla,
          modulos_activos: data.evento.modulos_activos,
          nombre: "Invitado de muestra",
          acompanantes: 1,
          estado: "pendiente",
        }}
      />
    </main>
  );
}
