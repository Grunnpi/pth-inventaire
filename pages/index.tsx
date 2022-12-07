import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>PTH Inventaire</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          SGDF, <a href="https://nextjs.org">Pays Thionvillois</a>
        </h1>

        <p className={styles.description}>
          Gestion du matériel{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="/inventaire" className={styles.card}>
            <h2>Tentes &rarr;</h2>
            <p>Liste des tentes du groupe et de leur détails</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Matos &rarr;</h2>
            <p>Les gamelles, le froissartage, etc !</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Evenement &rarr;</h2>
            <p>Gestion d'un week-end ou un evenement</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Autre &rarr;</h2>
            <p>
              Puisqu'il faut bien mettre le reste quelque part.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
