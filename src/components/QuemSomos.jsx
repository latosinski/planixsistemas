import styles from './QuemSomos.module.css';

const servicos = [
  {
    icone: '🌐',
    titulo: 'Sites Institucionais',
    descricao:
      'Presença online profissional com design responsivo e otimização para mecanismos de busca.',
  },
  {
    icone: '🛒',
    titulo: 'E‑commerce',
    descricao:
      'Lojas virtuais completas, seguras e com experiência de compra pensada para converter visitantes em clientes.',
  },
  {
    icone: '⚙️',
    titulo: 'Sistemas Web',
    descricao:
      'Aplicações online sob medida para automatizar processos e gerenciar informações de qualquer lugar.',
  },
  {
    icone: '🖥️',
    titulo: 'Sistemas Desktop',
    descricao:
      'Softwares instalados localmente, ideais para operações que exigem desempenho e segurança offline.',
  },
  {
    icone: '📱',
    titulo: 'Landing Pages',
    descricao:
      'Páginas de alta conversão para campanhas, lançamentos e captação de leads qualificados.',
  },
  {
    icone: '🔧',
    titulo: 'Manutenção e Suporte',
    descricao:
      'Acompanhamento contínuo para garantir que seu site ou sistema esteja sempre atualizado e seguro.',
  },
];

export default function QuemSomos() {
  return (
    <section id="quem-somos" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Quem somos</h2>
          <p>
            A VercelSistemas é uma empresa especializada em desenvolvimento de
            sites e sistemas. Unimos design moderno e tecnologia para entregar
            soluções digitais que realmente funcionam para o seu negócio.
          </p>
        </div>

        <div className={styles.grid}>
          {servicos.map(({ icone, titulo, descricao }) => (
            <div key={titulo} className={styles.card}>
              <div className={styles.icone}>{icone}</div>
              <h3>{titulo}</h3>
              <p>{descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}