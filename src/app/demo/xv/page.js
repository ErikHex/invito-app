import Invitacion from '@/components/invitaciones/Invitacion';

export const metadata = {
  title: 'Aura XV · Una noche, mil recuerdos | Invito',
  description: 'Una invitación de XV años moderna, minimalista y llena de momentos especiales.',
};

const datos = {
  plantilla: 'aura_xv', evento_nombre: 'Los XV de Valentina', nombre: 'Andrea',
  estado: 'pendiente', acompanantes: 1, mesa_nombre: 'Luna',
  configuracion: {
    nombres: ['Valentina'], encabezado: 'El comienzo de mi nueva historia',
    fechaHora: '2027-08-21T17:00:00-06:00', zonaHoraria: 'America/Mexico_City',
    mensajeBase: 'Quince años de sueños, risas y personas que hacen mi vida especial. Hoy comienza un nuevo capítulo y me hace muy feliz que formes parte de él. ¿Creamos un recuerdo más?',
    ceremonia: { hora: '17:00 h', lugar: 'Capilla de Santa María', direccion: 'Ubicación de muestra. Los datos se personalizan para tu evento.' },
    recepcion: { hora: '19:00 h', lugar: 'Jardín de la Luna', direccion: 'Una noche para bailar, reír y celebrar juntos.', foto: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85', fotoAlt: 'Ambientación de una celebración, fotografía de referencia' },
    vestimenta: { codigo: 'Formal, con tu toque', descripcion: 'Ven con el look que te haga sentir increíble. El tono lavanda está reservado para la quinceañera.' },
    regalos: { mensaje: 'Tenerte conmigo es lo más importante. Si deseas regalarme un detalle, lo recibiré con mucho cariño.', sobres: true },
    galeria: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
    ],
    itinerario: [
      { hora: '17:00', titulo: 'Un momento para agradecer', lugar: 'Ceremonia' },
      { hora: '19:00', titulo: 'Comienza la magia', lugar: 'Bienvenida en el jardín' },
      { hora: '20:00', titulo: 'Mi primer vals', lugar: 'Pista principal' },
      { hora: '20:30', titulo: 'Algo rico para compartir', lugar: 'Cena' },
      { hora: '21:30', titulo: 'La pista es nuestra', lugar: '¡A bailar!' },
    ],
  },
};

export default function DemoXVPage() {
  return <Invitacion datos={datos} preview />;
}
