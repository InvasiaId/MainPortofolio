import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Portofolio — Pengembang & Desainer',
  description: 'Portofolio pengembang dan desainer yang menampilkan karya situs web, aplikasi seluler, desain 3D, video, desain grafis, serta perangkat keras dan IoT.',
  keywords: ['portfolio', 'developer', 'designer', '3D', 'web', 'android', 'IoT'],
  openGraph: {
    title: 'Portofolio — Pengembang & Desainer',
    description: 'Menampilkan karya saya di bidang situs web, aplikasi seluler, desain 3D, video, desain grafis, dan perangkat keras.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="lazyOnload" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
