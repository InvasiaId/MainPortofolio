export async function GET(request) {
  const host = process.env.SMTP_HOST || 'EMPTY';
  const user = process.env.SMTP_USER || 'EMPTY';
  const pass = process.env.SMTP_PASS || 'EMPTY';
  
  return Response.json({
    diagnostics: {
      SMTP_HOST: host,
      SMTP_USER: user,
      SMTP_PASS_IS_EMPTY: pass === 'EMPTY',
      SMTP_PASS_LENGTH: pass.length,
      SMTP_PASS_STARTS_WITH: pass !== 'EMPTY' ? pass.substring(0, 8) : 'N/A',
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
    }
  });
}
