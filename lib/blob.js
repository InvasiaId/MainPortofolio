import { put, del, list } from '@vercel/blob';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_MODEL_SIZE = 20 * 1024 * 1024;  // 20MB

export function validateFile(file, category = 'image') {
  const errors = [];

  if (category === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`Invalid image type: ${file.type}. Allowed: jpg, png, webp, gif`);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      errors.push(`Image too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 5MB`);
    }
  } else if (category === 'video') {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.push(`Invalid video type: ${file.type}. Allowed: mp4, webm`);
    }
    if (file.size > MAX_VIDEO_SIZE) {
      errors.push(`Video too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 50MB`);
    }
  } else if (category === 'model') {
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (!['glb', 'gltf'].includes(ext) && !ALLOWED_MODEL_TYPES.includes(file.type)) {
      errors.push(`Invalid 3D model type. Allowed: .glb, .gltf`);
    }
    if (file.size > MAX_MODEL_SIZE) {
      errors.push(`Model too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 20MB`);
    }
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
