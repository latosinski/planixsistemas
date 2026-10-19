export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Planix Sistemas',
        url: 'https://planixsistemas.vercel.app',
        logo: 'https://planixsistemas.vercel.app/img/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+55-11-99999-9999', // Troque pelo seu telefone real
          contactType: 'customer service',
        },
      },
      {
        '@type': 'WebSite',
        name: 'Planix Sistemas',
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