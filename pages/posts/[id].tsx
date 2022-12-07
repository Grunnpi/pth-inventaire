import Layout from '../../components/layout'
import { getPostData } from '../../lib/posts';
import Head from 'next/head';
import utilStyles from '../../styles/utils.module.css'

import useSwr from 'swr'
import type { Inventaire } from '../../interfaces'

const fetcher = (url: string) => fetch(url).then((res) => res.json())


export default function Post({ id } : {id: string}) {
  const { data: post, error } = useSwr<Inventaire>('/api/inventaire/' + id, fetcher)

  if (error) return <div>Erreur de chargement un objet</div>
  if (!post) return <div>Chargement objet en cours...</div>

  return (
    <Layout home="false">
     <Head>
        <title>{post.title}</title>
      </Head>
    <article>
      <h1 className={utilStyles.headingXl}>{post.title}</h1>
      <div className={utilStyles.lightText}>
        {post.contentDeMoi}
      </div>
    </article>
    </Layout>
  )
}