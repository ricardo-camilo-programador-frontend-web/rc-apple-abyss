import type { MetadataRoute } from 'next';

const BASE_URL = 'https://click-on-the-malus-domestica-ide.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/apple-varieties`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
