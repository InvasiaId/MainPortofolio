import nodemailer from 'nodemailer';

export async function GET(request) {
  const host = process.env.SMTP_HOST || 'EMPTY';
  const user = process.env.SMTP_USER || 'EMPTY';
  const pass = process.env.SMTP_PASS || 'EMPTY';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';

  let verifyResult = 'NOT_CHECKED';
  let verifyError = null;

  if (host !== 'EMPTY' && user !== 'EMPTY' && pass !== 'EMPTY') {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      await transporter.verify();
      verifyResult = 'SUCCESS';
    } catch (err) {
      verifyResult = 'FAILED';
      verifyError = err.message;
    }
  }

  return Response.json({
    diagnostics: {
      SMTP_HOST: host,
      SMTP_USER: user,
      SMTP_PORT: port,
      SMTP_SECURE: secure,
      SMTP_PASS_IS_EMPTY: pass === 'EMPTY',
      SMTP_PASS_LENGTH: pass.length,
      SMTP_VERIFY: verifyResult,
      SMTP_ERROR: verifyError,
    }
  });
}
