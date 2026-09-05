import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { sanitizeObject } from '@/lib/sanitize';

export async function POST(request) {
  try {
    const body = await request.json();
    const data = sanitizeObject(body);

    if (!data.name || !data.email || !data.message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profile = await prisma.profile.findFirst();
    const toEmail = profile?.contactEmail;

    if (!toEmail) {
      return Response.json({ error: 'Contact email not configured by admin' }, { status: 500 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
      console.error('SMTP credentials missing in environment variables');
      return Response.json({ error: 'Mail server not configured correctly' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${data.name}" <${process.env.SMTP_USER}>`,
      replyTo: data.email,
      to: toEmail,
      subject: `New Contact Form Message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #333;">New Message from Portfolio</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Contact email error:', error);
    return Response.json({ error: `Failed to send message: ${error.message}` }, { status: 500 });
  }
}
