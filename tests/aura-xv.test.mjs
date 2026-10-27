import test from 'node:test';
import assert from 'node:assert/strict';
import { fechaInvitacion, fechaDeCuentaRegresiva, actualizarFechaCuentaRegresiva, tiempoRestante, enlaceSeguro, enlaceRegalo } from '../src/lib/aura-xv.js';
import { catalogoPlantillas } from '../src/components/invitaciones/plantillas/catalogo.js';

test('la fecha escrita no se desplaza por la zona horaria y rechaza fechas inválidas', () => {
  assert.equal(fechaInvitacion('2027-08-21T00:30:00+14:00'), '21 de agosto de 2027');
  assert.equal(fechaInvitacion('2027-02-30'), null);
  assert.equal(fechaInvitacion(undefined), null);
});

test('la fecha del resumen se deriva y se sincroniza con la cuenta regresiva', () => {
  assert.equal(fechaDeCuentaRegresiva('2027-08-21T18:30:00-06:00'), '2027-08-21');
  assert.equal(fechaDeCuentaRegresiva('2027-02-30T18:30:00-06:00'), null);
  assert.equal(actualizarFechaCuentaRegresiva('2027-08-21T18:30:00-06:00', '2027-09-10'), '2027-09-10T18:30:00-06:00');
  assert.equal(actualizarFechaCuentaRegresiva(null, '2027-09-10'), '2027-09-10T17:00:00-06:00');
  assert.equal(actualizarFechaCuentaRegresiva('2027-08-21T18:30:00-06:00', ''), null);
});

test('la cuenta regresiva calcula intervalos, termina en cero y maneja datos incompletos', () => {
  const now = Date.parse('2027-08-20T00:00:00Z');
  assert.deepEqual(tiempoRestante('2027-08-21T01:02:03Z', now), { dias: 1, horas: 1, minutos: 2, segundos: 3 });
  assert.deepEqual(tiempoRestante('2020-01-01', now), { dias: 0, horas: 0, minutos: 0, segundos: 0 });
  assert.equal(tiempoRestante(''), null);
  assert.equal(tiempoRestante('no es fecha'), null);
});

test('enlaces externos no permiten scripts ni protocolos arbitrarios', () => {
  assert.equal(enlaceSeguro('javascript:alert(1)'), null);
  assert.equal(enlaceSeguro('data:text/html,test'), null);
  assert.equal(enlaceSeguro('https://maps.google.com/'), 'https://maps.google.com/');
  assert.equal(enlaceRegalo('www.liverpool.com.mx'), 'https://www.liverpool.com.mx/');
  assert.equal(enlaceRegalo('javascript:alert(1)'), null);
});

test('las plantillas tienen identificadores independientes', () => {
  assert.deepEqual(catalogoPlantillas.map(p => p.id), ['editorial', 'aura_xv', 'nocturno', 'jardin_romantico']);
  assert.equal(catalogoPlantillas.find(p => p.id === 'aura_xv').version, 1);
});
