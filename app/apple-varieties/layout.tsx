import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Origins of Apple Names | Apple of the Infinite Abyss',
  description: 'Discover the origin and meaning behind popular apple varieties like Fuji, Honeycrisp, Granny Smith and more.',
  openGraph: {
    title: 'The Origins of Apple Names',
    description: 'Discover the origin and meaning behind popular apple varieties like Fuji, Honeycrisp, Granny Smith and more.',
    images: [
      {
        url: 'https://preview.redd.it/i-made-an-infographic-explaining-how-different-apple-v0-o2ypbjd9fru41.png?width=1080&crop=smart&auto=webp&s=97dfb851de6921382eaf504afd800897d8974a4a',
        width: 1080,
        height: 1350,
        alt: 'Apple Varieties Infographic',
      },
    ],
  },
};

export default function AppleVarietiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
