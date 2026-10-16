import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { sanitizeObject, rateLimit, getClientIp } from '@/lib/sanitize';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000);
    if (!limit.allowed) {
      return Response.json(
        { error: `Terlalu banyak pesan. Mohon tunggu ${limit.retryAfter} detik sebelum mencoba lagi.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = sanitizeObject(body);

    if (!data.name || data.name.length < 2 || data.name.length > 100) {
      return Response.json({ error: 'Nama harus diisi (2 - 100 karakter).' }, { status: 400 });
    }

    if (!data.email || !EMAIL_REGEX.test(data.email) || data.email.length > 150) {
      return Response.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    if (!data.message || data.message.length < 5 || data.message.length > 3000) {
      return Response.json({ error: 'Pesan harus diisi (5 - 3000 karakter).' }, { status: 400 });
    }

    // 1. Simpan pesan ke Database agar tidak pernah hilang
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
      },
    });

    const profile = await prisma.profile.findFirst();
    const toEmail = profile?.contactEmail || process.env.SMTP_USER;

    // 2. Kirim notifikasi email jika SMTP dikonfigurasi
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST && toEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const senderEmail = process.env.SMTP_USER === 'resend' 
          ? 'onboarding@resend.dev' 
          : process.env.SMTP_USER;

        const safeName = escapeHtml(data.name);
        const safeEmail = escapeHtml(data.email);
        const safeMessage = escapeHtml(data.message);

        const mailOptions = {
          from: `"Kontak Portofolio" <${senderEmail}>`,
          replyTo: data.email,
          to: toEmail,
          subject: `Pesan baru dari formulir kontak — ${data.name}`,
          text: `Nama: ${data.name}\nEmail: ${data.email}\n\nPesan:\n${data.message}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #D6FF01; padding-bottom: 8px;">Pesan Baru dari Portofolio</h2>
              <p style="margin: 12px 0;"><strong>Nama Pengirim:</strong> ${safeName}</p>
              <p style="margin: 12px 0;"><strong>Email Pengirim:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></p>
              <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #D6FF01;">
                <p style="margin: 0; font-weight: 600; color: #475569; margin-bottom: 6px;">Isi Pesan:</p>
                <p style="margin: 0; white-space: pre-wrap; color: #1e293b; line-height: 1.6;">${safeMessage}</p>
              </div>
              <p style="margin-top: 24px; font-size: 0.85rem; color: #94a3b8; text-align: center;">Terkirim otomatis dari Website Portofolio M. Dandi Fadli</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (mailError) {
        console.error('Email delivery error (message saved in DB):', mailError);
      }
    }

    return Response.json({ success: true, message: 'Pesan berhasil dikirim!' }, { status: 200 });

  } catch (error) {
    console.error('Contact submit error:', error);
    return Response.json({ error: 'Gagal mengirim pesan. Silakan coba lagi.' }, { status: 500 });
  }
}
