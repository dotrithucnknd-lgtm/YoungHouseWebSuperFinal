import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://trohoalac.com';

  // Core pages of the website
  const routes = [
    '',
    '/about',
    '/privacy',
    '/term',
    '/blog',
    '/phong-tro',
    '/pass-phong-public',
  ];

  const sitemapEntries = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/phong-tro' || route === '/pass-phong-public'
      ? 'daily'
      : route === '/blog'
        ? 'weekly'
        : 'monthly') as any,
    priority: route === '' ? 1.0 : route.startsWith('/phong-tro') || route.startsWith('/pass-phong') ? 0.9 : 0.8,
  }));

  return sitemapEntries;
}
