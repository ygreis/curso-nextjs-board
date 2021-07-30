import { AppProps } from 'next/app';
import '../styles/global.scss';
import { Header } from '../components/Header';
import { Provider as NextAuthProvider } from 'next-auth/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalOptions = {
  'client-id': 'AWHyYH1keJQMwGac-chQP3eg_53KeoUXhgcFAQ_j-knuhjnO6QzsD4x25vNu5rehBJvE-UWNTGwBsy9B',
  currency: 'BRL',
  intent: 'capture'
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <PayPalScriptProvider options={paypalOptions}>
        <Header />
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </NextAuthProvider>
    
  )
}

export default MyApp
