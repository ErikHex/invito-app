const extensions = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);

export function validatePhotoUpload(input) {
  if (!input || typeof input.eventoId !== 'string' ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(input.eventoId)) {
    return null;
  }
  const extension = extensions.get(input.contentType);
  if (!extension || !Number.isSafeInteger(input.size) || input.size < 1 || input.size > 8 * 1024 * 1024) return null;
  return { eventoId: input.eventoId.toLowerCase(), contentType: input.contentType, size: input.size, extension };
}

export function canUploadPhoto(session, eventoId) {
  return Boolean(session?.eventos?.some(evento => evento.id === eventoId && ['admin', 'titular'].includes(evento.rol)));
}
