import Hero from '@/components/Hero';
import QuemSomos from '@/components/QuemSomos';
import Beneficios from '@/components/Beneficios';
import Projetos from '@/components/Projetos';
import Etapas from '@/components/Etapas';

import Faq from '@/components/Faq';
import Contato from '@/components/Contato';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <QuemSomos />
      <Beneficios />
      <Projetos />
      <Etapas />

      <Faq />
      <Contato />
      <Footer />
    </>
  );
}