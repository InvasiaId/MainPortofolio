import { getSession } from '@/lib/auth';
import { uploadFile, validateFile } from '@/lib/blob';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'projects';
    const fileCategory = formData.get('fileCategory') || 'image';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = validateFile(file, fileCategory);
    if (!validation.valid) {
      return Response.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    const url = await uploadFile(file, folder);

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return Response.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
}
