import Layout from '/components/layout'
import Head from 'next/head';
import utilStyles from '/styles/utils.module.css'

export default function Custom404() {
  return (
    <Layout>
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
  )
}