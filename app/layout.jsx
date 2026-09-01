import './globals.css';

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
      <body>
        {children}
      </body>
    </html>
  );
}
