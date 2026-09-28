export async function panel(client, operacion, datos = {}) {
  const { data, error } = await client.rpc('panel_operacion', { operacion, datos });
  if (error) {
    const message = error.code === '23505'
      ? 'Ese enlace o correo ya está asignado. Revisa los datos antes de continuar.'
      : error.code === '23514' || error.code === '23502'
        ? 'Revisa los datos: los importes deben ser válidos y el abono no puede superar el precio.'
        : error.message;
    throw new Error(message);
  }
  return data;
}
