/** HEIC/HEIF often have empty or non-image MIME in the browser; trust extension too. */
export function isImageLikeFile(file) {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  const n = (file.name || '').toLowerCase();
  return n.endsWith('.heic') || n.endsWith('.heif');
}

/** Use with file inputs so iOS/macOS HEIC is selectable where supported. */
export const IMAGE_FILE_ACCEPT = 'image/*,.heic,.heif';
