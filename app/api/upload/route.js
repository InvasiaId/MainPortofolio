import { getSession } from '@/lib/auth';
import { uploadFile, validateFile } from '@/lib/blob';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    const fileCategory = formData.get('fileCategory') || 'image';
    const folder = fileCategory === 'pdf' ? 'profile' : formData.get('folder') || 'projects';

    if (!file) {
      return Response.json({ error: 'Berkas belum dipilih.' }, { status: 400 });
    }

    const validation = validateFile(file, fileCategory);
    if (!validation.valid) {
      return Response.json({ error: validation.errors.join(', ') }, { status: 400 });
    }

    if (fileCategory === 'pdf') {
      const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (new TextDecoder().decode(signature) !== '%PDF-') {
        return Response.json({ error: 'Isi berkas bukan dokumen PDF yang valid.' }, { status: 400 });
      }
    }

    const url = await uploadFile(file, folder);

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return Response.json({ error: 'Pengunggahan berkas gagal.' }, { status: 500 });
  }
}
