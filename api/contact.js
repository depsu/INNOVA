import { Resend } from 'resend';

// 1. Inicializa Resend (toma la API key de las variables de Vercel)
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Correos de destino (toma los correos de las variables de Vercel)
const ownerEmailsString = process.env.OWNER_EMAILS;

export default async function handler(request, response) {
  // Solo permitir peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = request.body;

    // 3. Validar campos básicos
    // Usamos 'nombre' (de index.html) o 'empresa' (de otros formularios)
    const name = body.nombre || body.empresa || 'Contacto Web';
    const email = body.email;

    if (!email) {
      return response.status(400).json({ message: 'El email es requerido.' });
    }

    // 4. Preparar la lista de destinatarios
    const recipientList = ownerEmailsString.split(',').map(e => e.trim());

    // 5. Construir un cuerpo de email detallado
    // Esto incluirá automáticamente cualquier campo que envíe el formulario
    let emailHtml = `
      <h2>Nuevo Lead desde Formulario Web</h2>
      <hr>
      <p><strong>Nombre/Empresa:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
    `;

    // Añadir otros campos si existen
    if (body.telefono) {
      emailHtml += `<p><strong>Teléfono:</strong> ${body.telefono}</p>`;
    }
    if (body.perfil) {
      emailHtml += `<p><strong>Perfil:</strong> ${body.perfil}</p>`;
    }
    if (body.comuna) {
      emailHtml += `<p><strong>Comuna/Ciudad:</strong> ${body.comuna}</p>`;
    }
    if (body.como_nos_conocio) {
      emailHtml += `<p><strong>Cómo nos conoció:</strong> ${body.como_nos_conocio}</p>`;
    }
    // Para el formulario de empleadores
    if (body.motivo_citacion) {
      emailHtml += `<p><strong>Motivo de citación:</strong><br/>${body.motivo_citacion.replace(/\n/g, '<br/>')}</p>`;
    }
    // Para el formulario de contacto/trabajadores
    if (body.mensaje) {
      emailHtml += `<p><strong>Mensaje:</strong><br/>${body.mensaje.replace(/\n/g, '<br/>')}</p>`;
    }

    // 6. Enviar el correo
    await resend.emails.send({
      from: 'Web Innovabogados <onboarding@resend.dev>', // El plan gratuito de Resend requiere 'onboarding@resend.dev'
      to: recipientList,
      reply_to: email, // Para que puedas "Responder" directamente al cliente
      subject: `Nuevo mensaje de ${name} (${email})`,
      html: emailHtml,
    });

    // 7. Responder al frontend
    return response.status(200).json({ message: 'Correo enviado exitosamente.' });

  } catch (error) {
    console.error("Error al enviar correo:", error.message);
    return response.status(500).json({ message: 'Error en el servidor.' });
  }
}