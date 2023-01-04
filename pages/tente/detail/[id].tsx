import Head from 'next/head';
import Image from 'next/image'
import Container from '../../../components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import { useSession, signIn, signOut } from "next-auth/react"


import useSwr from 'swr'
import type { Inventaire } from '../../../interfaces'
import { useRouter } from 'next/router';

import Zoom from "next-image-zoom";

import AlertConfirm, { Button } from 'react-alert-confirm';
import "react-alert-confirm/lib/style.css";

import { useState } from "react";

const Post = () => {
  const { data: session } = useSession()

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const router = useRouter()
  const { id } = router.query
  const { data: post, error } = useSwr<Inventaire>(`/api/gsheet/tente/detail/${id}`, fetcher)
  if (error) return <div>Erreur de chargement un truc</div>

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const file = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    };
    setFile(file);
  };

  const handleImage = async (event) => {

    event.preventDefault()

    const [action] = await AlertConfirm({title:'Sûr de vouloir supprimer cet évenement ?!', desc:"un si bel évenement...."});
    if (action) {
      // Stop the form from submitting and refreshing the page.

      // Get data from the form.
      const data = { file: file.data}

      // Send the data to the server in JSON format.
      const JSONdata = JSON.stringify(data)

      // API endpoint where we send form data.
      const endpoint = '/api/gsheet/image/test'

      // Form the request for sending data to the server.
      const options = {
        // The method is POST because we are sending data.
        method: 'POST',
        // Tell the server we're sending JSON.
        headers: {
          'Content-Type': 'application/json',
        },
        // Body of the request is the JSON data we created above.
        body: JSONdata,
      }

      // Send the form data to our forms API on Vercel and get a response.
      const response = await fetch(endpoint, options)

      // Get the response data from server as JSON.
      // If server returns the name submitted, that means the form works.
      const result = await response.json()
      alert(`Mise à jour : ${result.message}`)

    }
  }






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

                <form onSubmit={handleImage}>
                  <input type="file" name="files" onChange={handleFileChange}></input>
                  <button type="submit">🗑 Images ?️</button>
                </form>


                <div className="md:w-48 mt-2 sm:mt-0">
                  <Zoom
                      alt={post.title}
                      height={30}
                      width={40}
                      src={post.contentDeMoi}
                      className="rounded-full"
                      layout={"responsive"}
                  />
                </div>
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
