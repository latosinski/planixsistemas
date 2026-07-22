'use client';

import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({ image, tag, title, description, onClose }) {
  const overlayRef = useRef(null);

  // Fecha ao clicar no overlay (fora do conteúdo)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Opcional: fechar com tecla Escape já está tratado no componente pai,
  // mas podemos manter aqui também para redundância.
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.content}>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <img
          src={image}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.tag}>{tag}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}