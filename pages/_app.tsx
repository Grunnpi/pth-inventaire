import '../styles/globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { EvenementProvider } from "@context/evenement";

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          <EvenementProvider>
            <Component {...pageProps} />
          </EvenementProvider>
        </ThemeProvider>
      </SessionProvider>
    )
}
