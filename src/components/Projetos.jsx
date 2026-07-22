'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Projetos.module.css';
import Modal from './Modal';

const projetosData = [
  {
    tag: 'Sistema Web',
    titulo: 'Psicologia Integrativa',
    descricao:
      'Site integrado com plataforma de marcação de consultas com dashboards e integrado.',
    imagem:
      '/img/projetos/psicologia.jpg',
  },
  {
    tag: 'E-commerce',
    titulo: 'Cut Pack',
    descricao:
      'Loja virtual com assinatura, catálogo online, carrinho e pagamento online.',
    imagem:
      '/img/projetos/cut_pack.jpg',
  },
  {
    tag: 'Site Institucional',
    titulo: 'Estúdio Arq',
    descricao:
      'Site moderno com portfólio de projetos, equipe e gerenciamento de conteúdo.',
    imagem:
      '/img/projetos/estudio_arq.jpg',
  },
    {
    tag: 'Landing Page',
    titulo: 'Trader Max Pró',
    descricao:
      'Página de captura para para promover sistema de tecnologia.',
    imagem:
      '/img/projetos/site_trader.jpg',
  },
  {
    tag: 'Sistema Desktop',
    titulo: 'TraderMaxPro',
    descricao:
      'Sistema de gerenciamento de operações de Day Trade.',
    imagem:
      '/img/projetos/tradermaxpro.jpg'
  },
  {
    tag: 'Dashboard',
    titulo: 'Contas à Pagar e Receber',
    descricao:
      'Sistema dashboard de contas à pagar e receber com atualização em tempo real.',
    imagem:
      '/img/projetos/contas.jpg',
  },
  {
    tag: 'Sistema Web',
    titulo: 'Controle de Estoque',
    descricao:
      'Controle de estoque e logística para pequenas e médias empresas.',
    imagem:
      '/img/projetos/controle_estoque.jpg',
  },
  {
    tag: 'Transforme sua Planilha',
    titulo: 'Planilha Excel',
    descricao:
      'Transforme sua planilha excel em um sistema desktop ou web, com banco de dados.',
    imagem:
      '/img/projetos/planilha_dashboard.jpg'
  },
  {
    tag: 'Dashboard Corretores',
    titulo: 'Corretores de Imóveis',
    descricao:
      'Gerenciador para corretores, dashboard completo, vendas, locaçãoes e contratos.',
    imagem:
      '/img/projetos/imobi.jpg'
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
            Confira alguns dos sites e sistemas que desenvolvemos com excelência.
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
          onClose={closeModal}
        />
      )}
    </section>
  );
}