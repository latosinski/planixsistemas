import styles from './Etapas.module.css';

const etapas = [
  {
    numero: '1',
    titulo: 'Briefing e entendimento',
    descricao:
      'Conversamos para entender seu negócio, objetivos e requisitos do projeto.',
  },
  {
    numero: '2',
    titulo: 'Prototipação e design',
    descricao:
      'Criamos protótipos e layouts para validar a experiência do usuário.',
  },
  {
    numero: '3',
    titulo: 'Desenvolvimento ágil',
    descricao:
      'Codificamos o site ou sistema com as melhores tecnologias do mercado.',
  },
  {
    numero: '4',
    titulo: 'Testes e validação',
    descricao:
      'Realizamos testes completos para garantir performance e usabilidade.',
  },
  {
    numero: '5',
    titulo: 'Lançamento e suporte',
    descricao:
      'Publicamos o projeto e oferecemos suporte contínuo para ajustes e evolução.',
  },
];

export default function Etapas() {
  return (
    <section id="etapas" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Como trabalhamos</h2>
          <p>
            Nosso processo de desenvolvimento é transparente e focado em
            resultados.
          </p>
        </div>

        <div className={styles.lista}>
          {etapas.map(({ numero, titulo, descricao }) => (
            <div key={numero} className={styles.item}>
              <div className={styles.numero}>{numero}</div>
              <div className={styles.conteudo}>
                <h3>{titulo}</h3>
                <p>{descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}