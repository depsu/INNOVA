// api/contact.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  // === CREDENCIALES (SOLO PRUEBA) ===
  const MAIL_USER = 'carolina.torres@innovabogados.cl';
  const MAIL_PASS = 'carolina.torres1234';

  // Usa el HOST DEL SERVIDOR cPanel si lo tienes (suele tener SSL válido)
  // Ej: 10429host.dedicados.cl  (ajústalo si tu hosting te dio otro)
  const SMTP_HOST = '10429host.dedicados.cl';  // <— PROBAR ESTE
  const SMTP_HOST_ALT = 'mail.innovabogados.cl'; // <— fallback si lo anterior no existe

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, phone, message } = body || {};

    // Intento A: 587 STARTTLS en hostname del servidor (más compatible en Vercel)
    let transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
      // Si el certificado no cuadra con el host, fuerza SNI:
      tls: { servername: SMTP_HOST },
    });

    try {
      await transporter.verify();
    } catch (e1) {
      // Intento B: mismo 587 pero contra mail.tu-dominio
      transporter = nodemailer.createTransport({
        host: SMTP_HOST_ALT,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: MAIL_USER, pass: MAIL_PASS },
        tls: { servername: SMTP_HOST_ALT },
      });
      try {
        await transporter.verify();
      } catch (e2) {
        // Intento C: 465 SSL contra hostname del servidor
        transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: 465,
          secure: true,
          auth: { user: MAIL_USER, pass: MAIL_PASS },
          tls: { servername: SMTP_HOST },
        });
        try {
          await transporter.verify();
        } catch (e3) {
          // Intento D (último recurso de test): ignora validación SSL (NO dejar en prod)
          transporter = nodemailer.createTransport({
            host: SMTP_HOST_ALT,
            port: 465,
            secure: true,
            auth: { user: MAIL_USER, pass: MAIL_PASS },
            tls: { servername: SMTP_HOST_ALT, rejectUnauthorized: false },
          });
          await transporter.verify(); // si falla aquí, devolvemos el error abajo
        }
      }
    }

    const info = await transporter.sendMail({
      from: `"Web Innovabogados" <${MAIL_USER}>`,
      to: ['carolina.torres@innovabogados.cl', 'rivera.ale98@gmail.com'],
      subject: `Nuevo mensaje – ${name || 'Sin nombre'}`,
      text:
`Nombre: ${name || '-'}
Email: ${email || '-'}
Teléfono: ${phone || '-'}
Mensaje:
${message || '-'}`,
      replyTo: email || undefined,
    });

    return res.status(200).json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
