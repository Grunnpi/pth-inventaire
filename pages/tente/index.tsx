import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../../components/layout';
import Container from '../../components/Container';
import BlogPostCard from '../../components/BlogPostCard';

import utilStyles from '/styles/utils.module.css';

import useSwr from 'swr'
import type { Inventaire } from '../../interfaces'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const { data: allPostsData, error } = useSwr<Inventaire[]>('/api/tente/tout', fetcher)

  if (error) return <div>Erreur de chargement inventaire</div>
  if (!allPostsData) return <div>Chargement en cours...</div>

  return (
    <Container>
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

              <div className="flex gap-1 flex-col md:flex-col">
              {allPostsData.map((inventaire) => (
                  <BlogPostCard
                    title={inventaire.contentDeMoi}
                    slug={inventaire.id}
                    //gradient="from-[#D8B4FE] to-[#818CF8]"
                    gradient="from-[#0000FF] to-[#6EE7B7]"
                  />
              ))}
              </div>


          </section>
        </Layout>
    </Container>
  );
}
