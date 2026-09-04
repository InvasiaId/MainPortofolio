import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Portfolio — Developer & Designer',
  description: 'Full-stack developer and designer portfolio showcasing web, mobile, 3D design, video, graphic design, and hardware/IoT projects.',
  keywords: ['portfolio', 'developer', 'designer', '3D', 'web', 'android', 'IoT'],
  openGraph: {
    title: 'Portfolio — Developer & Designer',
    description: 'Showcasing my work across web, mobile, 3D, video, graphic design, and hardware projects.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
