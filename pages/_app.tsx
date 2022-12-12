import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }: AppProps) {
        /*
         const mySession = {
               expires: new Date(Date.now() + 2 * 86400).toISOString(),
               user: { email: "a", name: "Delta", image: "" },
             }
        pageProps.session=mySession
        */
  return (
      <SessionProvider
        //session={mySession}
        session={pageProps.session}
      >
        <Component {...pageProps} />
      </SessionProvider>
    )
}
