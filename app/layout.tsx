
import './styles/base.css';
import './styles/globals.css';
import { Geist } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/footer/Footer';

const geist = Geist({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body>
        <Header/>
        {children}
        {/*<Footer/>*/}
      </body>
    </html>
  );
}
