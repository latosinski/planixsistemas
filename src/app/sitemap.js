export default function sitemap() {
  const baseUrl = 'https://planixsistemas.vercel.app'; // substitua pelo domínio real

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}