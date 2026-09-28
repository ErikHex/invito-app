const MAX_SIDE = 1920;
const QUALITY = 0.82;

export async function optimizePhoto(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  let canvas;
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('No se pudo leer la fotografía. Elige otro archivo.'));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      throw new Error('La fotografía no tiene dimensiones válidas.');
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar la fotografía. Intenta de nuevo.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
    if (!webp) throw new Error('No se pudo convertir la fotografía. Intenta con otro archivo.');
    // Some browsers silently encode PNG instead. Never mislabel those bytes as WebP.
    // Keep the original when converting would increase the download size.
    if (webp.type !== 'image/webp' || webp.size >= file.size) return file;
    return webp;
  } finally {
    URL.revokeObjectURL(url);
    if (canvas) { canvas.width = 0; canvas.height = 0; }
  }
}
