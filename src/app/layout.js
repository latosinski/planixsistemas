import { Inter, Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Planix Sistemas | Desenvolvimento de Sites e Sistemas Profissionais',
  description:
    'A planix Sistemas cria sites modernos e sistemas sob medida para sua empresa. Design, tecnologia e estratégia digital.',
  keywords: [
    'desenvolvimento de sites',
    'criação de sistemas',
    'sites profissionais',
    'sistemas web',
    'agência digital',
    'Planix Sistemas',
  ],
  authors: [{ name: 'PlanixSistemas' }],
  openGraph: {
    title: 'Planix Sistemas | Sites e Sistemas Profissionais',
    description:
      'Desenvolvemos soluções sob medida para o seu negócio. Mais presença digital, eficiência e resultados.',
    type: 'website',
    url: 'https://planixsistemas.vercel.app/',
    images: [
      {
        url: 'https://planixsistemas.vercel.app//img/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlanixSistemas',
    description: 'Desenvolvimento de sites e sistemas sob medida.',
    images: ['https://planixsistemas.vercel.app//img/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body 
         id="topo"
         style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <Header />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}