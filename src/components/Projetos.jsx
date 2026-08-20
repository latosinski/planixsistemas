'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Projetos.module.css';
import Modal from './Modal';

const projetosData = [
  {
    tag: 'Sistema Fluxo de Caixa',
    titulo: 'Sistema Fluxo de Caixa',
    descricao:
      'Sistema com visão rápida da saúde financeira do mês atual.',
    imagem:
      '/img/projetos/fluxocaixa.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/fluxodecaixa/index.html',
  },
  {
    tag: 'Sistema Paper_Craft',
    titulo: 'Paper Craft',
    descricao:
      'Sistema ERP para controle operacional de lojas online, rotinas de gestão em uma única plataforma.',
    imagem:
      '/img/projetos/cut_pack.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/paper/index.html',
  },
  {
    tag: 'Sistema Agro Gestão',
    titulo: 'Agro Gestão',
    descricao:
      'Sistema de Gestão de propriedades rurais, estoque, cultivos, áreas e talhões.',
    imagem:
      '/img/projetos/agro.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/agro/index.html',
  },
    {
    tag: 'Sistema Ordem de Serviço',
    titulo: 'Ordem de Serviço',
    descricao:
      'Sistema completo com ordens de serviço, orçamentos, agenda técnica, clientes, produtos e serviços.',
    imagem:
      '/img/projetos/service.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/ordemservico/index.html',
  },
  {
    tag: 'Sistema Desktop',
    titulo: 'TraderMaxPro',
    descricao:
      'Sistema de gerenciamento de operações de Day Trade.',
    imagem:
      '/img/projetos/tradermaxpro.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/tradermaxpro/tradermaxpro.html',
  },
  {
    tag: 'Sistema Financeiro',
    titulo: 'Finanças Pessoais',
    descricao:
      'Sistema dashboard pa controle financeiro com atualização em tempo real.',
    imagem:
      '/img/projetos/contas.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/financas/index.html',
  },
  {
    tag: 'Controle de Estoque',
    titulo: 'Controle de Estoque',
    descricao:
      'Controle de estoque e logística para pequenas e médias empresas.',
    imagem:
      '/img/projetos/controle_estoque.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/estoque/index.html',
  },
  {
    tag: 'Sistema de Monitoramento',
    titulo: 'Valor OnLine',
    descricao:
      'Plataforma de Inteligência e Reputação Digital',
    imagem:
      '/img/projetos/valor_online.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/valor/index.html',
  },
  {
    tag: 'Sistema Clinic Pró',
    titulo: 'Clinic Pró',
    descricao:
      'Sistema ERP com agenda, consultas, pacientes, profissionais, planos de saúde.',
    imagem:
      '/img/projetos/clinicpro.jpg',
      link: 'https://planixsistemas.vercel.app/sistema/clinica/index.html',
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
          link={selectedProject.link}   // ← adicione esta linha
          onClose={closeModal}
            />
      )}
    </section>
  );
}