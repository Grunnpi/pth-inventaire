import '../styles/globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { EvenementProvider } from "@context/evenement";
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()
  return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          <EvenementProvider>
            <Component key={router.asPath} {...pageProps} />
          </EvenementProvider>
        </ThemeProvider>
      </SessionProvider>
    )
}
