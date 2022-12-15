import Head from 'next/head';
import Image from 'next/image'
import Container from '../../../components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import useSwr from 'swr'
import type { Inventaire } from '../../../interfaces'
import { useRouter } from 'next/router';

import Zoom from "next-image-zoom";

const Post2 = () => {
  const router = useRouter()
  const { id } = router.query

  return <p>Post: {id}</p>
}

const Post = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())

   const router = useRouter()
   const { id } = router.query


  const { data: post, error } = useSwr<Inventaire>(`/api/gsheet/tente/detail/${id}`, fetcher)

  if (error) return <div>Erreur de chargement un truc</div>

  if (!post) {
  return (<Container
                 title={`???`}
                 description="Je charge..."
               >
                 <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
                   <div className="flex justify-between w-full mb-8">
          <div>
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
              Patience
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              <PacmanLoader color="hsla(216, 67%, 53%, 1)" />
            </p>
          </div>
        </div>
        <div className="prose dark:prose-dark w-full">ceci n'est pas une tente...</div>
      </article>
    </Container> )
  }
  else {
      return (<Container
          title={`${post.title} - Code Snippet`}
          description="A collection of code snippets – including serverless functions, Node.js scripts, and CSS tricks."
        >
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {post.title}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  {post.contentDeMoi}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <Zoom
                    alt={post.title}
                    height={90}
                    width={120}
                    src={post.contentDeMoi}
                    className="rounded-full"
                    layout={"responsive"}
                />
              </div>
            </div>
            <div className="prose dark:prose-dark w-full">ça c'est une tente</div>
          </article>
        </Container> )
  }

/*
  return (
  <Container>
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
              unoptimized={process.env.imageForLocal === "true" ? true:false}
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
    </Container>
  )
*/
}

export default Post
