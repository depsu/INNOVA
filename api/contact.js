const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const { name, email, phone, message } = req.body;

    // ⚠️ SOLO PARA PRUEBA LOCAL. NO SUBAS ESTO AL REPO.
    const MAIL_USER = 'carolina.torres@innovabogados.cl';   // tu casilla en cPanel
    const MAIL_PASS = 'carolina.torres1234'; // contraseña de esa casilla

    const transporter = nodemailer.createTransport({
      host: 'mail.innovabogados.cl',
      port: 465,          // 465 = SSL
      secure: true,       // true si usas 465
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    // (Opcional) Verifica conexión SMTP y credenciales
    await transporter.verify();

    await transporter.sendMail({
      from: `"Web Innovabogados" <${MAIL_USER}>`,       // el FROM debe ser la misma casilla
      to: ['carolina.torres@innovabogados.cl', 'rivera.ale98@gmail.com'], // destinos
      subject: `Nuevo mensaje – ${name}`,
      text:
`Nombre: ${name}
Email: ${email}
Teléfono: ${phone || '-'}
Mensaje:
${message}`,
      replyTo: email, // al responder, va al cliente
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('MAIL ERROR', {
      message: e.message,
      code: e.code,
      command: e.command,
      response: e.response,
    });
    return res.status(500).json({ ok: false, error: e.message });
  }
};
