'use client';

import { useState } from 'react';
import styles from './Contato.module.css';

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro no servidor');
      }

      setStatus('success');
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <section id="contato" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Solicite um orçamento</h2>
          <p>Descreva seu projeto e receba uma proposta sob medida.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="nome"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
          <input
            type="email"
            name="email"
            placeholder="Seu melhor e-mail"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
          <input
            type="tel"
            name="telefone"
            placeholder="WhatsApp com DDD (opcional)"
            value={formData.telefone}
            onChange={handleChange}
            disabled={status === 'loading'}
          />
          <textarea
            name="mensagem"
            rows="4"
            placeholder="Conte sobre o site ou sistema que você precisa"
            value={formData.mensagem}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          ></textarea>

          <button
            type="submit"
            className="btn primary"
            style={{ justifyContent: 'center', width: '100%' }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar solicitação'}
          </button>

          {status === 'success' && (
            <p className={styles.success}>
              ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
            </p>
          )}

          {status === 'error' && (
            <p className={styles.error}>
              ❌ {errorMsg || 'Erro ao enviar. Tente novamente.'}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}