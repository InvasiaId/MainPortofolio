import { put, del, list } from '@vercel/blob';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
const MAX_PDF_SIZE = 4 * 1024 * 1024;   // 4MB, within serverless request payload limits

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_MODEL_SIZE = 20 * 1024 * 1024;  // 20MB

export function validateFile(file, category = 'image') {
  const errors = [];

  if (category === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push('Jenis gambar tidak valid. Gunakan JPG, PNG, WebP, atau GIF.');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      errors.push('Ukuran gambar terlalu besar. Maksimal 5 MB.');
    }
  } else if (category === 'video') {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.push('Jenis video tidak valid. Gunakan MP4 atau WebM.');
    }
    if (file.size > MAX_VIDEO_SIZE) {
      errors.push('Ukuran video terlalu besar. Maksimal 50 MB.');
    }
  } else if (category === 'model') {
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (!['glb', 'gltf'].includes(ext) && !ALLOWED_MODEL_TYPES.includes(file.type)) {
      errors.push('Jenis model 3D tidak valid. Gunakan berkas .glb atau .gltf.');
    }
    if (file.size > MAX_MODEL_SIZE) {
      errors.push('Ukuran model terlalu besar. Maksimal 20 MB.');
    }
  } else if (category === 'pdf') {
    if (file.type !== 'application/pdf' || !file.name?.toLowerCase().endsWith('.pdf')) {
      errors.push('File harus berupa dokumen PDF.');
    }
    if (file.size > MAX_PDF_SIZE) {
      errors.push('Ukuran dokumen terlalu besar. Maksimal 4 MB.');
    }
  } else {
    errors.push('Jenis berkas tidak didukung.');
  }

  return { valid: errors.length === 0, errors };
}

export async function uploadFile(file, folder = 'projects') {
  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteFile(url) {
  try {
    await del(url);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(prefix = '') {
  const { blobs } = await list({ prefix });
  return blobs;
}
