import styles from './Beneficios.module.css';

const beneficios = [
  {
    icone: '🌐',
    titulo: 'Presença digital 24h',
    descricao:
      'Seu site no ar todos os dias, atraindo clientes e transmitindo credibilidade.',
  },
  {
    icone: '📱',
    titulo: 'Design responsivo',
    descricao:
      'Sites que se adaptam perfeitamente a celulares, tablets e computadores.',
  },
  {
    icone: '⚙️',
    titulo: 'Sistemas sob medida',
    descricao:
      'Softwares desenvolvidos exatamente para as necessidades do seu negócio.',
  },
  {
    icone: '🚀',
    titulo: 'Otimização para resultados',
    descricao:
      'Sites leves, rápidos e preparados para SEO e conversão.',
  },
  {
    icone: '🔒',
    titulo: 'Segurança e estabilidade',
    descricao:
      'Proteção de dados, backups e ambientes confiáveis para sua operação.',
  },
  {
    icone: '📊',
    titulo: 'Relatórios e métricas',
    descricao:
      'Acompanhe o desempenho do seu site e sistemas com dashboards inteligentes.',
  },
];

export default function Beneficios() {
  return (
    <section id="beneficios" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Vantagens de ter um site ou sistema profissional</h2>
          <p>
            Entregamos soluções completas que impactam diretamente a eficiência
            e o crescimento da sua empresa.
          </p>
        </div>

        <div className={styles.grid}>
          {beneficios.map(({ icone, titulo, descricao }) => (
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