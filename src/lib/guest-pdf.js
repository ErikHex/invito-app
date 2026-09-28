import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const purple = '#79528d';
const ink = '#302a39';
const muted = '#746b7c';
const compare = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
const clean = value => String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim();

export function prepararLista(invitados, mesas) {
  const nombres = new Map(mesas.map(mesa => [mesa.id, mesa.nombre]));
  return invitados.map(inv => ({
    nombre: clean(inv.nombre) || 'Sin nombre',
    mesa: clean(nombres.get(inv.mesa_id)) || 'Sin asignar',
    sinMesa: !nombres.has(inv.mesa_id),
    estado: inv.estado === 'confirmado' ? 'Confirmado' : inv.estado === 'rechazado' ? 'No asistirá' : 'Sin respuesta',
    lugares: 1 + Number(inv.acompanantes || 0),
    entradas: Number(inv.entradas || 0),
  })).sort((a, b) => compare.compare(a.nombre, b.nombre));
}

export function crearPdfInvitados({ eventoNombre, invitados, mesas, generado = new Date() }) {
  const rows = prepararLista(invitados, mesas);
  const doc = new jsPDF({ format: 'letter', unit: 'mm', compress: true });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = width - margin * 2;
  const fecha = generado.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const titulo = clean(eventoNombre) || 'Tu evento';
  doc.setProperties({ title: `Recepción - ${titulo}`, author: 'Invito', subject: 'Respaldo de invitados y mesas' });

  function header(seccion) {
    doc.setFillColor('#f5f0f7');
    doc.rect(0, 0, width, 49, 'F');
    doc.setTextColor(ink);
    doc.setFont('times', 'bold');
    doc.setFontSize(27);
    doc.text('invito', margin, 16);
    // El acento floral se dibuja como vector para mantenerlo nítido al imprimir.
    doc.setDrawColor(purple);
    doc.setLineWidth(0.65);
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 4;
      doc.line(40 + Math.cos(angle) * 2, 10 + Math.sin(angle) * 2, 40 - Math.cos(angle) * 2, 10 - Math.sin(angle) * 2);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(muted);
    doc.text('RESPALDO PARA RECEPCIÓN', width - margin, 14, { align: 'right' });
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    const lines = doc.splitTextToSize(titulo, contentWidth);
    const displayed = lines.slice(0, 2);
    if (lines.length > 2) displayed[1] = displayed[1].slice(0, -3) + '...';
    doc.setTextColor(ink);
    doc.text(displayed, margin, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(purple);
    doc.text(seccion, margin, 44);
  }

  const common = {
    margin: { top: 55, right: margin, bottom: 24, left: margin },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, textColor: ink, lineColor: '#e7dfeb', lineWidth: 0.2, cellPadding: 3, minCellHeight: 12, valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: purple, textColor: '#ffffff', fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: '#fdfcf9' },
    rowPageBreak: 'avoid',
  };
  const confirmados = rows.filter(row => row.estado === 'Confirmado').reduce((sum, row) => sum + row.lugares, 0);
  const entradas = rows.reduce((sum, row) => sum + row.entradas, 0);
  autoTable(doc, {
    ...common,
    startY: 73,
    head: [['Invitado / familia', 'Mesa', 'Respuesta', 'Lugares', 'Entradas\nprevias', 'Llegan\nahora']],
    body: rows.length ? rows.map(row => [row.nombre, row.mesa, row.estado, row.lugares, row.entradas, '']) : [[{ content: 'Todavía no hay invitados registrados.', colSpan: 6 }]],
    columnStyles: { 0: { cellWidth: contentWidth - 130 }, 1: { cellWidth: 34 }, 2: { cellWidth: 32 }, 3: { cellWidth: 20, halign: 'center' }, 4: { cellWidth: 22, halign: 'center' }, 5: { cellWidth: 22, halign: 'center' } },
    willDrawPage: ({ pageNumber }) => {
      header('01 / LISTA ALFABÉTICA');
      if (pageNumber === 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(ink);
        doc.text(`${rows.length} invitaciones  /  ${confirmados} lugares confirmados  /  ${entradas} entradas previas`, margin, 57);
        doc.setTextColor(muted);
        doc.setFontSize(8);
        doc.text('Lugares incluye al titular y sus acompañantes. Anota únicamente las nuevas llegadas.', margin, 63);
        doc.text('Sin respuesta y No asistirá requieren revisión con el anfitrión antes de dar acceso.', margin, 68);
      }
    },
  });

  doc.addPage();
  const porMesa = [...rows].sort((a, b) => Number(a.sinMesa) - Number(b.sinMesa) || compare.compare(a.mesa, b.mesa) || compare.compare(a.nombre, b.nombre));
  autoTable(doc, {
    ...common,
    startY: 55,
    head: [['Mesa', 'Invitado / familia', 'Respuesta', 'Lugares']],
    body: porMesa.length ? porMesa.map(row => [row.mesa, row.nombre, row.estado, row.lugares]) : [[{ content: 'Todavía no hay asignaciones que mostrar.', colSpan: 4 }]],
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold', textColor: purple }, 1: { cellWidth: contentWidth - 97 }, 2: { cellWidth: 35 }, 3: { cellWidth: 22, halign: 'center' } },
    willDrawPage: () => header('02 / DISTRIBUCIÓN POR MESA'),
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor('#ded8e1');
    doc.line(margin, height - 20, width - margin, height - 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(muted);
    doc.text(`Descargado: ${fecha} (${zona})`, margin, height - 15);
    doc.text('Copia sin conexión. Los cambios y las anotaciones no se sincronizan.', margin, height - 10);
    doc.text(`${page} / ${pages}`, width - margin, height - 10, { align: 'right' });
  }
  return doc;
}

export function nombrePdf(eventoNombre) {
  const slug = clean(eventoNombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  return `invito-recepcion-${slug || 'evento'}.pdf`;
}
