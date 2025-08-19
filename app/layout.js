import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Detail Page Generator',
  description: 'Hotel detail page template generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 