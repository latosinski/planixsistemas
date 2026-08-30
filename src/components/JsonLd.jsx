export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'VercelSistemas',
        url: 'https://www.seusite.com.br',
        logo: 'https://planixsistemas.vercel.app/img/logo.png', // opcional
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+55-51 98212-77790',
          contactType: 'customer service',
        },
      },
      {
        '@type': 'WebSite',
        name: 'VercelSistemas',
        url: 'https://planixsistemas.vercel.app',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}