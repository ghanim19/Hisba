import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';
import '../styles/globals.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CartProvider } from '../context/CartContext';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
     <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </CartProvider>
    </SessionProvider>
  );
}

export default MyApp;
