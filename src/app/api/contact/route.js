import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { nome, email, telefone, mensagem } = await request.json();

    // Validação básica
    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email e mensagem.' },
        { status: 400 }
      );
    }

    // Configurar transporte SMTP (exemplo com Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Site VercelSistemas" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: 'Novo contato do site VercelSistemas',
      html: `
        <h2>Novo contato via formulário</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
        <p><strong>Mensagem:</strong> ${mensagem}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}