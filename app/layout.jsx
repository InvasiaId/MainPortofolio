import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'M. Dandi Fadli — Full-Stack Developer & 3D Designer',
  description: 'Portofolio M. Dandi Fadli: Pengembang Full-Stack, Desain 3D & AR, Aplikasi Mobile, serta Perangkat Keras & IoT.',
  keywords: ['M. Dandi Fadli', 'portfolio', 'developer', 'full stack developer', 'designer', '3D', 'web', 'android', 'IoT', 'augmented reality'],
  openGraph: {
    title: 'M. Dandi Fadli — Full-Stack Developer & 3D Designer',
    description: 'Menampilkan karya dan proyek di bidang situs web, aplikasi seluler, desain 3D & animasi, serta proyek IoT.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="lazyOnload" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
