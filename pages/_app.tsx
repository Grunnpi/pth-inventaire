import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { Provider } from "react-redux";
import { wrapper, store } from "../store/store";

import { EvenementProvider } from "../context/evenement";

import Users from '../components/users'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          <EvenementProvider>
            <Provider store={store}>
              <Component {...pageProps} />
            </Provider>
          </EvenementProvider>
        </ThemeProvider>
      </SessionProvider>
    )
}

export default wrapper.withRedux(MyApp);