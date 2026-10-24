'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Projetos.module.css';
import Modal from './Modal';

const projetosData = [
  {
    tag: 'Sistema Fluxo de Caixa',
    titulo: 'Planix - Fluxo de Caixa',
    descricao:
      'Controle lançamentos, fluxo de caixa, metas, DRE, contas a pagar e receber, plano de contas, relatórios e projeções financeiras.',
    imagem:
      '/img/projetos/fluxocaixa.jpg',
      link: 'https://planixfluxodecaixa.vercel.app/',
  },
  {
    tag: 'Sistema Vendas Online',
    titulo: 'Planix Vendas Online',
    descricao:
      'Sistema Vendas Online é uma aplicação desktop desenvolvida para o controle operacional e financeiro de lojas online de pequeno e médio porte.',
    imagem:
      '/img/projetos/vendasonline.png',
      link: 'https://planixvendasonline.vercel.app/',
  },
  
  {
    tag: 'Sistema Operações DayTrade',
    titulo: 'Planix TraderMax',
    descricao:
      'Sistema de gerenciamento de operações de Day Trade.',
    imagem:
      '/img/projetos/tradermax.jpg',
      link: 'https://planixtradermax.vercel.app',
  },
];

export default function Projetos() {
  const [selectedProject, setSelectedProject] = useState(null);

  const openModal = (project) => setSelectedProject(project);
  const closeModal = useCallback(() => setSelectedProject(null), []);

  // Fechar com tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  // Bloquear scroll do body quando modal aberto
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  return (
    <section id="projetos" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Nossos projetos</h2>
          <p>
            Confira alguns dos sistemas que desenvolvemos com excelência.
          </p>
        </div>

        <div className={styles.grid}>
          {projetosData.map((proj) => (
            <div
              key={proj.titulo}
              className={styles.card}
              onClick={() => openModal(proj)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal(proj)}
            >
              <img
                src={proj.imagem}
                alt={proj.titulo}
                loading="lazy"
                className={styles.image}
              />
              <div className={styles.info}>
                <span className={styles.tag}>{proj.tag}</span>
                <h3>{proj.titulo}</h3>
                <p>{proj.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <Modal
          image={selectedProject.imagem}
          tag={selectedProject.tag}
          title={selectedProject.titulo}
          description={selectedProject.descricao}
          link={selectedProject.link}   // ← adicione esta linha
          onClose={closeModal}
            />
      )}
    </section>
  );
}