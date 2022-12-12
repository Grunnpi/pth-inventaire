import Layout from '../../components/layout'
import Head from 'next/head';
import Image from 'next/image'
import utilStyles from '../../styles/utils.module.css'

import useSwr from 'swr'
import type { Inventaire } from '../../interfaces'
import { useRouter } from 'next/router';

const Post2 = () => {
  const router = useRouter()
  const { id } = router.query

  return <p>Post: {id}</p>
}

const Post = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())

   const router = useRouter()
   const { id } = router.query


  const { data: post, error } = useSwr<Inventaire>(`/api/inventaire/${id}`, fetcher)

  if (error) return <div>Erreur de chargement un truc</div>
  if (!post) return <div>Chargement objet en cours...</div>

  return (
    <Layout home="false">
     <Head>
        <title>{post.title}</title>
      </Head>
    <article>
      <h1 className={utilStyles.headingXl}>{post.title}</h1>
      <div className={utilStyles.lightText}>
        {post.contentDeMoi}<br/>
        <Image
              src={post.contentDeMoi}
              alt="Image de la chose"
              width={200}
              height={150}
              unoptimized={process.env.imageForLocal}
              sizes="100vw"
              style={{
                      width: '100%',
                      height: 'auto',
                    }}
            />
        <br/>
      </div>
    </article>
    </Layout>
  )
}

export default Post
