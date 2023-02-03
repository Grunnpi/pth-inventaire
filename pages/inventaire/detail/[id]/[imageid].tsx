import Head from 'next/head';
import Image from 'next/image'
import Container from '@components/Container';

import PacmanLoader from "react-spinners/PacmanLoader";

import { useSession, signIn, signOut } from "next-auth/react"

import useSwr from 'swr'
import type { Inventaire } from '@interfaces'
import { useRouter } from 'next/router';

import Zoom from "next-image-zoom";

import { useState } from "react";


const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

const Post = () => {
  const { data: session } = useSession()

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const router = useRouter()
  const { id, imageid } = router.query
  const { data: post, error } = useSwr<Inventaire>(`/api/gsheet/inventaire/detail/${id}`, fetcher)
  if (error) return <div>Erreur de chargement un truc</div>

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  const [voirPleinEcran, setVoirPleinEcran] = useState(false);

  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    event.preventDefault()

    const body = new FormData();
    body.append("file", image);

    const response = await fetch("/api/upload", {
      method: "POST",
      body
    });

    const result = await response.json()

    // sauve la ref dans IMAGE

    // Get data from the form.
      const data = {
        rowid: "nouveau",
        id: "=LIGNE()",
        nom: image.name,
        commentaire: "",
        googleId: result.fileid,
        url: '=CONCAT("https://drive.google.com/uc?export=view&id=";INDIRECT("D" & LIGNE()))',
        visualisation: '=IMAGE(INDIRECT("E" & LIGNE()))'
      }

      // Send the data to the server in JSON format.
      var JSONdata = JSON.stringify(data)

      // API endpoint where we send form data.
      const endpoint = '/api/gsheet/image/nouveau'

      // Form the request for sending data to the server.
      var options = {
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
      const responseImage = await fetch(endpoint, options)

      // Get the response data from server as JSON.
      // If server returns the name submitted, that means the form works.
      const resultImage = await responseImage.json()

        alert(`Image dans gsheet : ${resultImage.message} avec ${resultImage.newid} pour ${id}`)

        var responseGetInventaire = await fetch(`/api/gsheet/inventaire/detail/${id}`)

        const unInventaireUpdate:Inventaire = await responseGetInventaire.json()
        unInventaireUpdate.imageid = resultImage.newid
        unInventaireUpdate.image_visu = '=IMAGE(INDIRECT("N" & LIGNE()))',
        unInventaireUpdate.image_url = '=RECHERCHEV(INDIRECT("E" & LIGNE());Image!A:E;5;FAUX)'

        JSONdata = JSON.stringify(unInventaireUpdate)
        options = {
          // The method is POST because we are sending data.
          method: 'POST',
          // Tell the server we're sending JSON.
          headers: {
            'Content-Type': 'application/json',
          },
          // Body of the request is the JSON data we created above.
          body: JSONdata,
        }

        alert(JSONdata)

        const responseUpdateInventaire = await fetch(`/api/gsheet/inventaire/update/${id}`, options)
        alert(responseUpdateInventaire.status)
        alert("Maj Inventaire")


  };


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
      const the_url = createObjectURL ? createObjectURL : "/images/profile.jpg"
      const the_alt = "nouvelle image"

      return (<Container
          title={`PTH [${post.nom}]`}
          description="A collection of code snippets – including serverless functions, Node.js scripts, and CSS tricks."
        >
          <article className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16 w-full">
            <div className="flex justify-between w-full mb-8">
              <div>
                <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
                  {post.nom}
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  <a href={`/inventaire/detail/${id}`} >
                    ◀️ Revenir vers {post.nom}
                  </a>
                </p>

                <div style={{position:(voirPleinEcran ? "static":"relative")}} className="w-full max-h-full place-content-center mt-2 sm:mt-0 rounded-lg shadow border p-2">
                    <a href="#" onClick={() => setVoirPleinEcran(!voirPleinEcran)}>
                      {voirPleinEcran ?
                        <Image
                            src={the_url}
                            alt={the_alt}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
                            fill
                            style={{objectFit:"contain"}}
                        />
                       :
                        <Image
                            src={the_url}
                            alt={the_alt}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
                            width={300}
                            height={300}
                            style={{objectFit:"contain"}}
                        />
                      }
                    </a>
                </div>
                <div style={{position:"relative"}} className="w-full truncate place-content-center mt-2 sm:mt-0 rounded-lg shadow border p-2">

                  <form >
                    <label for="files">Choisir une image (clickez ici)</label>
                    <input id="files" class="hidden" type="file" name="myImage" accept="image/*" onChange={uploadToClient} />
                  </form>

                  <span class="relative inline-flex rounded-md shadow-sm h-9 w-40">
                    <button
                      type="button"
                      className="w-80 h-9 bg-gray-200 rounded-lg dark:bg-gray-600 flex items-center justify-center  hover:ring-2 ring-gray-300  transition-all"
                      onClick={uploadToServer}
                    ><i class="bi bi-cloud-arrow-up"></i> Upload</button>
                    <span class="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                      <span class="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="prose dark:prose-dark w-full">ça c'est une tente</div>
          </article>
        </Container> )
  }
}

export default Post
