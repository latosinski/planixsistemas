import styles from './Depoimentos.module.css';

const depoimentos = [
  {
    texto:
      '“A VercelSistemas desenvolveu nosso site institucional e um sistema de orçamentos online. Profissionalismo e resultado excelente!”',
    nome: 'Carlos Mendes',
    cargo: 'Diretor, Construtora Nova',
    foto:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
  },
  {
    texto:
      '“Migraram nosso processo manual para um sistema web. Ganhamos produtividade e eliminamos erros.”',
    nome: 'Ana Oliveira',
    cargo: 'Gerente de Operações, LogTech',
    foto:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
  },
  {
    texto:
      '“Entregaram um e-commerce moderno que superou nossas expectativas. Design impecável e suporte ágil.”',
    nome: 'Roberto Almeida',
    cargo: 'CEO, Essência Cosméticos',
    foto:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
  },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>O que nossos clientes dizem</h2>
          <p>
            Empresas que confiaram na VercelSistemas para seus projetos digitais.
          </p>
        </div>

        <div className={styles.grid}>
          {depoimentos.map(({ texto, nome, cargo, foto }) => (
            <div key={nome} className={styles.card}>
              <p className={styles.texto}>{texto}</p>
              <div className={styles.autor}>
                <img
                  src={foto}
                  alt={`Foto de ${nome}`}
                  className={styles.foto}
                  loading="lazy"
                />
                <div>
                  <div className={styles.nome}>{nome}</div>
                  <div className={styles.cargo}>{cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}