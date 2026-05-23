import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/owner/', '/api/', '/checkout/'],
    },
    sitemap: 'https://trohoalac.com/sitemap.xml',
  };
}
