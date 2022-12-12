import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '/styles/utils.module.css';
import Link from 'next/link';

import { useSession, signIn, signOut } from "next-auth/react"
//import my_useSession from "/lib/my-session2"

const name = 'PTH Inventaire';
export const siteTitle = 'PTH Inv';

export default function Layout({ children, home }) {
  const { data: session } = useSession()
  if (!session) {
      return (
        <>
          Not signed ing <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )
    } else {
      return (
        <div className={styles.container}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
              name="description"
              content="Learn how to build a personal website using Next.js"
            />
            <meta
              property="og:image"
              content={`https://og-image.vercel.app/${encodeURI(
                siteTitle,
              )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
            />
            <meta name="og:title" content={siteTitle} />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
          <header className={styles.header}>
            {home ? (
              <>
                <Image
                  priority
                  src="/images/SGDF.png"
                  className={utilStyles.borderCircle}
                  width={150}
                  height={80}
                  alt=""
                />
                <h1 className={utilStyles.heading2Xl}><Link href="/">{name}</Link></h1>
              </>
            ) : (
              <>
                <Link href="/">
                  <Image
                    priority
                    src="/images/SGDF.png"
                    className={utilStyles.borderCircle}
                    height={30}
                    width={30}
                    alt=""
                  />
                </Link>
                <h2 className={utilStyles.headingLg}>
                  <Link href="/" className={utilStyles.colorInherit}>
                    {name}
                  </Link>
                </h2>
              </>
            )}
          </header>
          <main>{children}</main>

          {!home && (
            <div className={styles.backToHome}>
              <Link href="/">← Menu</Link>
            </div>
          )}
          <footer className={styles.footer}>
              <span className={styles.logo}>
                    <Image src={session.user.image} alt="Avatar logo" width={16} height={16} />
              </span>
              <a href="mailto:{session.user.email}">{session.user.name}</a> <button onClick={() => signOut()}>Sign out</button>{' '}
          </footer>
        </div>
      );
    }
}