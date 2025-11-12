// api/contact.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  // === CREDENCIALES (SOLO PRUEBA) ===
  const MAIL_USER = 'carolina.torres@innovabogados.cl';   // tu casilla en cPanel
  const MAIL_PASS = 'carolina.torres1234';                // su contraseña
  const SMTP_HOST = 'mail.innovabogados.cl';

  try {
    // Asegura parseo del body si llega como string
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, phone, message } = body || {};

    // 1) Intento con 465 (SSL)
    let transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: 465,
      secure: true,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
      // Si el certificado del hosting da problemas, descomenta para probar:
      // tls: { rejectUnauthorized: false },
    });

    try {
      await transporter.verify();
    } catch (e) {
      // 2) Fallback a 587 (STARTTLS)
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: MAIL_USER, pass: MAIL_PASS },
        // tls: { rejectUnauthorized: false },
      });
      await transporter.verify();
    }

    const info = await transporter.sendMail({
      from: `"Web Innovabogados" <${MAIL_USER}>`,     // from = misma cuenta autenticada
      to: [
        'carolina.torres@innovabogados.cl',
        'rivera.ale98@gmail.com',
      ],
      subject: `Nuevo mensaje – ${name || 'Sin nombre'}`,
      text:
`Nombre: ${name || '-'}
Email: ${email || '-'}
Teléfono: ${phone || '-'}
Mensaje:
${message || '-'}`,
      replyTo: email || undefined, // al responder, va al cliente
    });

    console.log('MAIL OK:', info.messageId);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('MAIL ERROR:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
