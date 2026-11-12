import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/site';

const BASE_URL = SITE_ORIGIN;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE_URL}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/apple-varieties`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
