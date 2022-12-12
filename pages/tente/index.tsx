import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../../components/layout';
import utilStyles from '/styles/utils.module.css';


import useSwr from 'swr'
import type { Inventaire } from '../../interfaces'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const { data: allPostsData, error } = useSwr<Inventaire[]>('/api/tente/tout', fetcher)

  if (error) return <div>Erreur de chargement inventaire</div>
  if (!allPostsData) return <div>Chargement en cours...</div>

  return (
    <Layout home="false">
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Pour gestion de l'inventaire du groupe</p>
        <p>
          (qui fait ça ? Voir ici la page {' '}
          <a href="/about">à propos</a>.)
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Trucs</h2>
        <ul className={utilStyles.list}>

          {allPostsData.map((inventaire) => (
            <li className={utilStyles.listItem} key={inventaire.id}>
            <Link href={`/tente/detail/${inventaire.id}`}>{inventaire.title}</Link>
            <br/>
            <small className={utilStyles.lightText}>
                {inventaire.contentDeMoi}
            </small>
            </li>
          ))}

        </ul>
      </section>
    </Layout>
  );
}
