'use client';

import { useState } from 'react';
import styles from './Faq.module.css';

const faqItems = [
  {
    pergunta: 'Quanto tempo leva para desenvolver um site ou sistema?',
    resposta:
      'O prazo varia conforme a complexidade: sites institucionais de 2 a 4 semanas; sistemas personalizados de 6 a 12 semanas. Após o briefing, fornecemos um cronograma detalhado.',
  },
  {
    pergunta: 'Vocês fazem sites responsivos (que funcionam no celular)?',
    resposta:
      'Sim, todos os nossos projetos são desenvolvidos com design responsivo, garantindo uma ótima experiência em smartphones, tablets e desktops.',
  },
  {
    pergunta: 'Preciso ter um domínio e hospedagem?',
    resposta:
      'Nós auxiliamos na escolha e configuração do domínio e hospedagem. Caso não tenha, podemos recomendar os melhores fornecedores e cuidar de toda a parte técnica.',
  },
  {
    pergunta: 'O sistema desenvolvido será web ou desktop?',
    resposta:
      'Trabalhamos com ambas as modalidades. A escolha depende da necessidade do seu negócio: sistemas web (acessíveis de qualquer lugar) ou desktop (instalados localmente).',
  },
  {
    pergunta: 'Oferecem suporte após a entrega do projeto?',
    resposta:
      'Sim. Oferecemos garantia de funcionamento e planos de manutenção para atualizações, correções e novas funcionalidades.',
  },
  {
    pergunta: 'Como solicito um orçamento?',
    resposta:
      'Preencha o formulário de contato com detalhes do seu projeto. Nossa equipe retornará em até 24 horas com uma proposta personalizada.',
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2>Perguntas frequentes</h2>
          <p>Respostas para as dúvidas mais comuns sobre nossos serviços.</p>
        </div>

        <div className={styles.lista}>
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`${styles.item} ${activeIndex === index ? styles.active : ''}`}
            >
              <button
                className={styles.pergunta}
                onClick={() => toggle(index)}
                aria-expanded={activeIndex === index}
              >
                {item.pergunta}
              </button>
              <div className={styles.resposta}>
                <p>{item.resposta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}