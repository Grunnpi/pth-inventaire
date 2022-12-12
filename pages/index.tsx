import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { useSession, signIn, signOut } from "next-auth/react"
//import my_useSession from "/lib/my-session2"

export default function Home() {
  const { data: session } = useSession()
  console.log("Home : session")
  console.log(session)
  if (session) {
      return (
          <div className={styles.container}>
            <Head>
              <title>PTH Inventaire</title>
              <meta name="description" content="SGDF Pays Thionvillois gestion inventaire" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
              <h1 className={styles.title}>
                SGDF, Pays Thionvillois
              </h1>

              <p className={styles.description}>
                <code className={styles.code}>🤝 inventaire à jour 😘</code>
              </p>

              <div className={styles.grid}>
                <a href="/evenement" className={styles.card}>
                  <h2>📆 Evenement &rarr;</h2>
                  <p>Gestion d'un week-end ou un evenement</p>
                </a>

                <a href="/tente" className={styles.card}>
                  <h2>🏕️ Tentes &rarr;</h2>
                  <p>Liste des tentes du groupe et de leur détails</p>
                </a>

                <a href="/matos" className={styles.card}>
                  <h2>🍳 Matos &rarr;</h2>
                  <p>Les gamelles, le froissartage, etc !</p>
                </a>

                <a href="/autre" className={styles.card}>
                  <h2>❓ Autre &rarr;</h2>
                  <p>
                    Puisqu'il faut bien mettre le reste quelque part.
                  </p>
                </a>
              </div>
            </main>

            <footer className={styles.footer}>
                  <span className={styles.logo}>
                        <Image src={session.user.image} alt="Avatar logo" width={16} height={16} />

                  </span>
                  <a href="mailto:{session.user.email}">{session.user.name}</a> <button onClick={() => signOut()}>Sign out</button>{' '}
              </footer>
          </div>
        )
    }
    return (
      <>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
        <button onClick={() => signOut()}>Sign out</button>{' '}
      </>
    )
}
