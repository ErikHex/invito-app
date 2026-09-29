import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleInvitation } from '../src/lib/sample-invitation.js';

test('samples preserve the saved event content and modules, without copying guest tokens', () => {
  const muestra = {
    plantilla: 'nocturno', nombre_evento: 'Nuestra celebración',
    configuracion: { fotoPortada: 'https://example.com/foto.jpg', mensajeBase: '' },
    modulos_activos: { sobre: false, musica: true, galeria: false },
    token: 'must-never-be-copied', nombre: 'Private guest', user_id: 'private-owner',
  };
  const datos = sampleInvitation(muestra);
  assert.deepEqual(datos.configuracion, muestra.configuracion);
  assert.deepEqual(datos.modulos_activos, muestra.modulos_activos);
  assert.equal(datos.evento_nombre, muestra.nombre_evento);
  assert.equal(datos.nombre, 'Invitado de muestra');
  assert.equal(datos.estado, 'pendiente');
  assert.equal('token' in datos, false);
  assert.equal('user_id' in datos, false);
});

test('cover embeds disable the envelope and music without changing the full invitation', () => {
  const muestra = { plantilla: 'aura_xv', modulos_activos: { sobre: true, musica: true, regalos: false } };
  assert.deepEqual(sampleInvitation(muestra, { portada: true }).modulos_activos,
    { sobre: false, musica: false, regalos: false });
  assert.equal(sampleInvitation(muestra).modulos_activos.sobre, true);
  assert.equal(sampleInvitation(muestra).modulos_activos.musica, true);
});
