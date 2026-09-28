import test from 'node:test';
import assert from 'node:assert/strict';
import { crearPdfInvitados, prepararLista, nombrePdf } from '../src/lib/guest-pdf.js';

test('el respaldo ordena nombres, conserva estados y calcula lugares sin exportar datos privados', () => {
  const rows = prepararLista([
    { nombre: 'Zoe', acompanantes: 2, entradas: 1, estado: 'confirmado', mesa_id: 'm', token: 'secreto', telefono: '555' },
    { nombre: 'Ángela', estado: 'rechazado', mesa_id: 'eliminada' },
  ], [{ id: 'm', nombre: 'Mesa 2' }]);
  assert.deepEqual(rows.map(r => r.nombre), ['Ángela', 'Zoe']);
  assert.equal(rows[0].mesa, 'Sin asignar');
  assert.equal(rows[0].estado, 'No asistirá');
  assert.equal(rows[1].lugares, 3);
  assert.equal(rows[1].entradas, 1);
  assert.ok(!JSON.stringify(rows).includes('secreto'));
});

test('genera ambas secciones sin invitados y pagina listas largas', () => {
  assert.equal(crearPdfInvitados({ eventoNombre: 'Prueba', invitados: [], mesas: [] }).getNumberOfPages(), 2);
  const invitados = Array.from({ length: 130 }, (_, i) => ({ nombre: `Familia ${i} con un nombre largo para verificar saltos de línea`, acompanantes: 2, estado: 'confirmado' }));
  const doc = crearPdfInvitados({ eventoNombre: 'Celebración de Ana y José', invitados, mesas: [] });
  assert.ok(doc.getNumberOfPages() > 4);
  assert.ok(doc.output('arraybuffer').byteLength > 1000);
  assert.equal(nombrePdf('Ana / José'), 'invito-recepcion-Ana-Jose.pdf');
});
