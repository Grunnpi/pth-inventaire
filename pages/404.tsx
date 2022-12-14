import Layout from '../components/layout'
import Head from 'next/head';
import utilStyles from '/styles/utils.module.css'

import Link from 'next/link';
import Container from '../components/Container';

export default function NotFound() {
  return (

  <Container title="404 – PTH">
        <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
            404 – Page même pas là
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Why show a generic 404 when I can make it sound mysterious? It seems
            you've found something that used to exist, or you spelled something
            wrong. I'm guessing you spelled something wrong. Can you double check
            that URL?
          </p>
          <Link
            href="/"
            className="p-1 sm:p-4 w-64 font-bold mx-auto bg-gray-200 dark:bg-gray-800 text-center rounded-md text-black dark:text-white"
          >
            Retour base
          </Link>
        </div>
      </Container>
/*
    <Layout home="false">
     <Head>
        <title>404</title>
      </Head>
    <article>
      <h1 className={utilStyles.headingXl}>404 - même pas là</h1>
      <div className={utilStyles.lightText}>
        plouf
      </div>
    </article>
    </Layout>
    */
  )
}