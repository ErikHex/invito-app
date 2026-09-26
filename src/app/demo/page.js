import Invitacion from "@/components/invitaciones/Invitacion";

export const metadata = {
  title: "Invito — Una invitación para recordar",
  description: "Descubre nuestra invitación digital: una experiencia personal para celebrar juntos.",
};

const datos = {
  plantilla: "editorial",
  nombre: "Andrea",
  evento_nombre: "Mariana & Santiago",
  estado: "pendiente",
  acompanantes: 1,
  mesa_nombre: "Olivo",
  configuracion: {
    editorial: {
      encabezado: "Nos casamos",
      lugar: "Jardín de los Olivos",
      fotoMensaje: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85",
      fotoMensajeAlt: "Fotografía de boda en blanco y negro",
      ceremonia: {
        hora: "17:00 h",
        lugar: "Jardín de los Olivos",
        foto: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85",
        fotoAlt: "Ambientación de una celebración, fotografía de referencia",
      },
      fotoAlt: "Un jardín preparado para celebrar una boda",
      encuadre: "center 55%",
    },
    mensajeBase: "Después de tantos caminos, elegimos uno juntos. Nos encantará que seas parte de este nuevo comienzo.",
    fechaHora: "2027-06-19T17:00:00-06:00",
    fotoPortada: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
    galeria: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85",
    ],
    itinerario: [
      { hora: "17:00", titulo: "El sí, para siempre", lugar: "Ceremonia · Jardín de los Olivos" },
      { hora: "18:00", titulo: "Un brindis por nosotros", lugar: "Cóctel de bienvenida · La terraza" },
      { hora: "19:30", titulo: "La noche es nuestra", lugar: "Cena y celebración · Salón principal" },
    ],
  },
};

export default function DemoPage() {
  return <Invitacion datos={datos} preview />;
}
