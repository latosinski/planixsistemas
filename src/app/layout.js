import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';
import JsonLd from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://planixsistemas.vercel.app'),
  title: 'Planix Sistemas | Desenvolvimento de Sites e Sistemas Profissionais',
  description: 'A Planix Sistemas cria sites modernos e sistemas sob medida para sua empresa. Design, tecnologia e estratégia digital.',
  
  verification: {
    google: 'VDE9xlogiIAX5qVdZoDS4ViiBkG__JGdn3vE092IvTc',
  },

  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Planix Sistemas | Sites e Sistemas Profissionais',
    description: 'Criamos sites e sistemas que transformam seu negócio. Mais presença digital, eficiência e resultados.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/img/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Planix Sistemas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planix Sistemas',
    description: 'Desenvolvimento de sites e sistemas sob medida.',
    images: ['/img/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      {/* AQUI ESTÁ A CORREÇÃO: O id="topo" foi restaurado na tag body */}
      <body id="topo" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <Header />
        {children}
        <WhatsAppButton />
        <JsonLd />
      </body>
    </html>
  );
}