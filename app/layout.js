import './globals.css';

export const metadata = {
  title: 'Polla Mundialista 2026',
  description: 'Pronosticos del Mundial FIFA 2026',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
