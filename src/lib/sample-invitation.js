// Use only the public sample projection, never actual guests or RSVP tokens.
export function sampleInvitation(muestra, { portada = false } = {}) {
  return {
    plantilla: muestra.plantilla,
    evento_nombre: muestra.nombre_evento,
    configuracion: muestra.configuracion,
    modulos_activos: {
      ...muestra.modulos_activos,
      ...(portada ? { sobre: false, musica: false } : {}),
    },
    nombre: 'Invitado de muestra',
    estado: 'pendiente',
    acompanantes: 1,
    mesa_nombre: 'Olivo',
  };
}
